variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "vpc_id" {
  type    = string
  default = "vpc-06f784c744962518b"
}

variable "subnet_ids" {
  type = list(string)
  default = [
    "subnet-0449e723d0ee7e806",
    "subnet-000ae23ab864754aa",
    "subnet-0f2174837d8f80921",
  ]
}

variable "scans_bucket" {
  description = "Existing S3 bucket the app uses for scan uploads."
  type        = string
  default     = "remindly-scans-470999030508"
}

variable "db_name" {
  type    = string
  default = "gowize"
}

variable "db_username" {
  type    = string
  default = "gowize"
}

variable "jwt_secret" {
  description = "Secret key for signing JWTs — must be at least 32 characters."
  type        = string
  sensitive   = true
}

variable "mail_host" {
  description = "SMTP host for sending OTP emails."
  type        = string
  default     = "smtp.gmail.com"
}

variable "mail_port" {
  description = "SMTP port."
  type        = number
  default     = 587
}

variable "mail_username" {
  description = "SMTP username / sender email address."
  type        = string
}

variable "mail_password" {
  description = "SMTP password or app password."
  type        = string
  sensitive   = true
}

variable "cors_origins" {
  description = "Allowed browser origins for the API."
  type        = string
  default     = "https://gowize.pro,https://www.gowize.pro"
}
