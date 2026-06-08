locals {
  app_name = "gowize-backend"
}

# ==========================================================================
# Database credentials
# ==========================================================================
resource "random_password" "db" {
  length  = 24
  special = false
}

# ==========================================================================
# ECR — Docker image repository
# ==========================================================================
resource "aws_ecr_repository" "app" {
  name                 = local.app_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })
}

# ==========================================================================
# IAM — ECS task execution role + task role
# ==========================================================================
data "aws_iam_policy_document" "ecs_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "execution" {
  name               = "${local.app_name}-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

resource "aws_iam_role_policy_attachment" "execution_basic" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "task" {
  name               = "${local.app_name}-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

data "aws_iam_policy_document" "app" {
  statement {
    sid       = "ScanBucketObjects"
    actions   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
    resources = ["arn:aws:s3:::${var.scans_bucket}/*"]
  }
  statement {
    sid       = "ScanBucketList"
    actions   = ["s3:ListBucket"]
    resources = ["arn:aws:s3:::${var.scans_bucket}"]
  }
  statement {
    sid       = "Textract"
    actions   = ["textract:DetectDocumentText", "textract:AnalyzeDocument", "textract:AnalyzeExpense"]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "task_app" {
  name   = "${local.app_name}-app"
  role   = aws_iam_role.task.id
  policy = data.aws_iam_policy_document.app.json
}

# ==========================================================================
# Security groups
# ==========================================================================
resource "aws_security_group" "ecs" {
  name        = "${local.app_name}-ecs"
  description = "GoWize ECS tasks"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP from anywhere (CloudFront fronts this)"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "rds" {
  name        = "${local.app_name}-rds"
  description = "GoWize RDS Postgres"
  vpc_id      = var.vpc_id

  ingress {
    description     = "Postgres from ECS tasks"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ==========================================================================
# RDS Postgres
# ==========================================================================
resource "aws_db_subnet_group" "main" {
  name       = "${local.app_name}-db"
  subnet_ids = var.subnet_ids
}

resource "aws_db_instance" "main" {
  identifier             = "${local.app_name}-db"
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  storage_type           = "gp3"
  storage_encrypted      = true
  db_name                = var.db_name
  username               = var.db_username
  password               = random_password.db.result
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  multi_az               = false
  skip_final_snapshot    = true
  apply_immediately      = true
  deletion_protection    = false
}

# ==========================================================================
# CloudWatch log group
# ==========================================================================
resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${local.app_name}"
  retention_in_days = 30
}

# ==========================================================================
# ECS Cluster
# ==========================================================================
resource "aws_ecs_cluster" "main" {
  name = local.app_name
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = ["FARGATE"]
  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }
}

# ==========================================================================
# ECS Task Definition
# ==========================================================================
resource "aws_ecs_task_definition" "app" {
  family                   = local.app_name
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 512
  memory                   = 1024
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([{
    name      = local.app_name
    image     = "${aws_ecr_repository.app.repository_url}:latest"
    essential = true

    portMappings = [{
      containerPort = 8080
      protocol      = "tcp"
    }]

    environment = [
      { name = "SPRING_PROFILES_ACTIVE",       value = "prod" },
      { name = "SPRING_JPA_HIBERNATE_DDLAUTO", value = "update" },
      { name = "SERVER_PORT",                  value = "8080" },
      { name = "AWS_REGION",                   value = var.aws_region },
      { name = "REMINDLY_S3_BUCKET",           value = var.scans_bucket },
      { name = "GOWIZE_CORS_ALLOWED_ORIGINS",  value = var.cors_origins },
      { name = "SPRING_DATASOURCE_URL",
        value = "jdbc:postgresql://${aws_db_instance.main.address}:5432/${var.db_name}" },
      { name = "SPRING_DATASOURCE_USERNAME", value = var.db_username },
      { name = "SPRING_DATASOURCE_PASSWORD", value = random_password.db.result },
      { name = "JWT_SECRET",                 value = var.jwt_secret },
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.app.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }

    healthCheck = {
      command     = ["CMD-SHELL", "curl -f http://localhost:8080/actuator/health || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 60
    }
  }])
}

# ==========================================================================
# ECS Service
# ==========================================================================
resource "aws_ecs_service" "app" {
  name            = local.app_name
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = true
  }

  lifecycle {
    ignore_changes = [task_definition]
  }
}
