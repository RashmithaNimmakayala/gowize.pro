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
# IAM — Elastic Beanstalk service role + EC2 instance role
# ==========================================================================
data "aws_iam_policy_document" "eb_service_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["elasticbeanstalk.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "eb_service" {
  name               = "${local.app_name}-eb-service"
  assume_role_policy = data.aws_iam_policy_document.eb_service_assume.json
}

resource "aws_iam_role_policy_attachment" "eb_service_health" {
  role       = aws_iam_role.eb_service.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth"
}

resource "aws_iam_role_policy_attachment" "eb_service_updates" {
  role       = aws_iam_role.eb_service.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy"
}

data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "instance" {
  name               = "${local.app_name}-instance"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

resource "aws_iam_role_policy_attachment" "web_tier" {
  role       = aws_iam_role.instance.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

# App's own AWS access (scan bucket + Textract) via the instance role — no static keys.
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

resource "aws_iam_role_policy" "app" {
  name   = "${local.app_name}-app"
  role   = aws_iam_role.instance.id
  policy = data.aws_iam_policy_document.app.json
}

resource "aws_iam_instance_profile" "instance" {
  name = "${local.app_name}-instance-profile"
  role = aws_iam_role.instance.name
}

# ==========================================================================
# Security groups
# ==========================================================================
resource "aws_security_group" "eb" {
  name        = "${local.app_name}-eb"
  description = "GoWize EB instance"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
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
    description     = "Postgres from EB instances"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.eb.id]
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
# Elastic Beanstalk application + version (bundle in S3)
# ==========================================================================
resource "aws_s3_bucket" "artifacts" {
  bucket = var.artifacts_bucket
}

resource "aws_s3_object" "bundle" {
  bucket = aws_s3_bucket.artifacts.id
  key    = "bundles/eb-bundle-${filemd5(var.bundle_path)}.zip"
  source = var.bundle_path
  etag   = filemd5(var.bundle_path)
}

resource "aws_elastic_beanstalk_application" "app" {
  name = local.app_name
}

resource "aws_elastic_beanstalk_application_version" "v" {
  name        = "v-${substr(filemd5(var.bundle_path), 0, 8)}"
  application = aws_elastic_beanstalk_application.app.name
  bucket      = aws_s3_bucket.artifacts.id
  key         = aws_s3_object.bundle.key
}

# ==========================================================================
# Elastic Beanstalk environment (single instance)
# ==========================================================================
resource "aws_elastic_beanstalk_environment" "env" {
  name                = "${local.app_name}-env"
  application         = aws_elastic_beanstalk_application.app.name
  solution_stack_name = var.solution_stack
  version_label       = aws_elastic_beanstalk_application_version.v.name

  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"
  }
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "ServiceRole"
    value     = aws_iam_role.eb_service.arn
  }
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.instance.name
  }
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.instance_type
  }
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = aws_security_group.eb.id
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "VPCId"
    value     = var.vpc_id
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "Subnets"
    value     = join(",", var.subnet_ids)
  }
  setting {
    namespace = "aws:ec2:vpc"
    name      = "AssociatePublicIpAddress"
    value     = "true"
  }
  setting {
    namespace = "aws:elasticbeanstalk:healthreporting:system"
    name      = "SystemType"
    value     = "enhanced"
  }

  # ---- Application environment variables ----
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SPRING_PROFILES_ACTIVE"
    value     = "prod"
  }
  # Auto-create the schema on first boot (prod profile defaults to "validate").
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SPRING_JPA_HIBERNATE_DDLAUTO"
    value     = "update"
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SERVER_PORT"
    value     = "5000"
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SPRING_DATASOURCE_URL"
    value     = "jdbc:postgresql://${aws_db_instance.main.address}:5432/${var.db_name}"
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SPRING_DATASOURCE_USERNAME"
    value     = var.db_username
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "SPRING_DATASOURCE_PASSWORD"
    value     = random_password.db.result
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "AWS_REGION"
    value     = var.aws_region
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "REMINDLY_S3_BUCKET"
    value     = var.scans_bucket
  }
  # Both spellings so @Value relaxed-binding resolves regardless of dash handling.
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "GOWIZE_CORS_ALLOWEDORIGINS"
    value     = var.cors_origins
  }
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "GOWIZE_CORS_ALLOWED_ORIGINS"
    value     = var.cors_origins
  }
}
