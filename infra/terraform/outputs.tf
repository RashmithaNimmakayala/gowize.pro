output "bucket_name" {
  description = "S3 bucket for uploaded scans."
  value       = aws_s3_bucket.scans.bucket
}

output "aws_region" {
  description = "Region the resources live in."
  value       = var.aws_region
}

output "backend_iam_user" {
  description = "IAM user the backend authenticates as."
  value       = aws_iam_user.app.name
}

# Sensitive — read with:  terraform output -raw backend_access_key_id
output "backend_access_key_id" {
  description = "Access key ID for the backend IAM user."
  value       = aws_iam_access_key.app.id
  sensitive   = true
}

# Sensitive — read with:  terraform output -raw backend_secret_access_key
output "backend_secret_access_key" {
  description = "Secret access key for the backend IAM user."
  value       = aws_iam_access_key.app.secret
  sensitive   = true
}
