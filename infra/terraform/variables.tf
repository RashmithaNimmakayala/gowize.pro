variable "aws_region" {
  description = "AWS region. Must support Amazon Textract (e.g. ap-south-1, us-east-1, eu-west-1)."
  type        = string
  default     = "ap-south-1"
}

variable "project" {
  description = "Project name, used as a prefix for resource names and tags."
  type        = string
  default     = "remindly"
}

variable "bucket_name" {
  description = "Globally-unique S3 bucket name for uploaded scan images."
  type        = string
}

variable "cors_origins" {
  description = "Origins allowed to upload directly to S3 via presigned URLs (the PWA dev/prod URLs)."
  type        = list(string)
  default     = ["http://localhost:5173", "http://localhost:5174"]
}

variable "scan_expiration_days" {
  description = "Days after which raw uploaded scans are auto-deleted from S3 (cost control). Set to 0 to disable."
  type        = number
  default     = 30
}
