output "nameservers" {
  description = "Set these as the NS records for gowize.pro at your registrar."
  value       = aws_route53_zone.primary.name_servers
}

output "zone_id" {
  value = aws_route53_zone.primary.zone_id
}

output "site_bucket" {
  description = "S3 bucket the built frontend is uploaded to."
  value       = aws_s3_bucket.site.bucket
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain (works before DNS delegation)."
  value       = aws_cloudfront_distribution.site.domain_name
}

output "cloudfront_distribution_id" {
  description = "Use for cache invalidations after each deploy."
  value       = aws_cloudfront_distribution.site.id
}

output "api_cloudfront_domain" {
  description = "HTTPS domain for the API (front of Elastic Beanstalk)."
  value       = aws_cloudfront_distribution.api.domain_name
}
