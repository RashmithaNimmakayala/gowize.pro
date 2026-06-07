output "api_url" {
  description = "Public base URL of the backend (Elastic Beanstalk environment)."
  value       = "http://${aws_elastic_beanstalk_environment.env.cname}"
}

output "eb_cname" {
  value = aws_elastic_beanstalk_environment.env.cname
}

output "rds_endpoint" {
  value = aws_db_instance.main.address
}

output "rds_password" {
  value     = random_password.db.result
  sensitive = true
}
