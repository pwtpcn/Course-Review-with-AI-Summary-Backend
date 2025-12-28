resource "docker_image" "redis" {
    name = "redis:alpine"
}

resource "docker_container" "redis" {
    image = docker_image.redis.image_id
    name  = "redis"
    env = [
        "REDIS_PASSWORD=password",
    ]
    ports {
        internal = 6379
        external = 6379
    }
}