package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

func main() {

	port := 6363
	servePath := "./"
	logPath := time.Now().UTC().Format(time.RFC3339) + "_site.log"

	logFile, err := os.Create(logPath)
	if err != nil {
		fmt.Errorf("Couldn't create log file: %v", err)
		return
	}
	defer logFile.Close()
	mulWriter := io.MultiWriter(logFile, os.Stdout)

	logger := log.New(mulWriter, "", log.LstdFlags)

	for {

		logger.Printf("Serving path '%s' on port %d, logging to '%s'\n",
			servePath, port, logPath)

		err := http.ListenAndServe(":"+strconv.Itoa(port), http.FileServer(http.Dir(servePath)))
		if err != nil {
			logger.Printf("Error serving files: %v\n", err)
		}
	}
}
