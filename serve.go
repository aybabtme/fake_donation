package main

import (
	"fmt"
	"github.com/aybabtme/color"
	"io"
	"log"
	"net/http"
	"os"
	"time"
)

var (
	port       = "6363"
	filePath   = "."
	healthPath = "/ping"
	logPath    = time.Now().UTC().Format(time.RFC3339) + "_site.log"
)

func healthHandler(l *log.Logger) func(http.ResponseWriter, *http.Request) {
	red := color.Red()
	return func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		l.Printf("Health check from %s: %#v\n", red.Get(r.RemoteAddr), r.Header)

	}
}

func fileHandler(l *log.Logger) func(http.ResponseWriter, *http.Request) {

	fileServer := http.FileServer(http.Dir(filePath))

	blue := color.LightBlue()
	green := color.LightGreen()
	cyan := color.Cyan()

	return func(w http.ResponseWriter, r *http.Request) {
		l.Printf("%s %v from %v: %#v\n",
			blue.Get(r.Method),
			green.Get(r.RequestURI),
			cyan.Get(r.RemoteAddr),
			r.Header)
		fileServer.ServeHTTP(w, r)
	}
}

func teeLogger(first io.Writer, second io.Writer) *log.Logger {
	mulWriter := io.MultiWriter(first, second)
	return log.New(mulWriter, "", log.LstdFlags)
}

func main() {

	logFile, err := os.Create(logPath)
	if err != nil {
		fmt.Errorf("Couldn't create log file: %v", err)
		return
	}
	defer logFile.Close()

	logger := teeLogger(logFile, os.Stdout)

	logger.Printf("Serving path '%s' on port %s, logging to '%s'\n", filePath, port, logPath)

	http.HandleFunc(healthPath, healthHandler(logger))
	http.HandleFunc("/", fileHandler(logger))

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		logger.Fatalf("Error serving files: %v\n", err)
	}
}
