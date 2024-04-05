package main

import (
	"fmt"
	"github.com/docker/docker/client"
	"log"
)

func main() {
	cli, err := client.NewClientWithOpts(client.FromEnv)

	if err != nil {
		log.Fatalf("Unable to create docker client")
	}

	imagename := "registry.gitlab.com/shar-workflow/shar/server:1.0.532"
	containername := "shar"
	portopening := "8080"
	inputEnv := []string{fmt.Sprintf("LISTENINGPORT=%s", portopening)}
	err = runContainer(cli, imagename, containername, portopening, inputEnv)
	if err != nil {
		log.Println(err)
	}

}
