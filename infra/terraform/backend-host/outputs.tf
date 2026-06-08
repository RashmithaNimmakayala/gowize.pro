output "ecr_repository_url" {
  description = "ECR URL to push Docker images to."
  value       = aws_ecr_repository.app.repository_url
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  value = aws_ecs_service.app.name
}

output "rds_endpoint" {
  value = aws_db_instance.main.address
}

output "rds_password" {
  value     = random_password.db.result
  sensitive = true
}
