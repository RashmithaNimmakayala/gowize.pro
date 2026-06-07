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

variable "solution_stack" {
  type    = string
  default = "64bit Amazon Linux 2023 v4.12.1 running Corretto 21"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "scans_bucket" {
  description = "Existing S3 bucket the app uses for scan uploads."
  type        = string
  default     = "remindly-scans-470999030508"
}

variable "artifacts_bucket" {
  description = "Globally-unique bucket for EB app version bundles."
  type        = string
  default     = "gowize-eb-artifacts-470999030508"
}

variable "db_name" {
  type    = string
  default = "gowize"
}

variable "db_username" {
  type    = string
  default = "gowize"
}

variable "cors_origins" {
  description = "Allowed browser origins for the API (frontend URLs)."
  type        = string
  default     = "https://d9mna2jm5ltjk.cloudfront.net,https://gowize.pro,https://www.gowize.pro"
}

variable "bundle_path" {
  description = "Local path to the EB application bundle (zip with application.jar)."
  type        = string
  default     = "../../../backend/build/eb/eb-bundle.zip"
}
