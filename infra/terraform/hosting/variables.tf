variable "aws_region" {
  description = "Region for the site S3 bucket (CloudFront is global)."
  type        = string
  default     = "ap-south-1"
}

variable "domain" {
  description = "Apex domain for the app."
  type        = string
  default     = "gowize.pro"
}

variable "site_bucket_name" {
  description = "Globally-unique S3 bucket holding the built frontend."
  type        = string
  default     = "gowize-site-470999030508"
}

variable "api_origin_domain" {
  description = "Elastic Beanstalk environment domain serving the API (HTTP origin)."
  type        = string
  default     = "gowize-backend-env.eba-jppnq67q.ap-south-1.elasticbeanstalk.com"
}

variable "enable_custom_domain" {
  description = "Attach gowize.pro + ACM TLS to CloudFront. Requires NS delegation first; until then deploy on the default *.cloudfront.net cert."
  type        = bool
  default     = false
}
