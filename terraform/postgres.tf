resource "docker_image" "postgres" {
    name = "postgres:18-alpine"
}

resource "docker_container" "postgres" {
  image = docker_image.postgres.image_id
  name  = "postgres"

  ports {
    internal = 5432
    external = 5432
  }

  env = [
    "POSTGRES_PASSWORD=password",
    "POSTGRES_USER=user",
    "POSTGRES_DB=db"
  ]
}