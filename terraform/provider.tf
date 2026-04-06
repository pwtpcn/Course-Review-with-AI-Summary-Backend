terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version =   "~> 3.6.2"
    }
  }
}

provider "docker" {
  # For Windows
  host = "npipe:////./pipe/docker_engine"

  # For Linux
  # host = "unix:///var/run/docker.sock"
}