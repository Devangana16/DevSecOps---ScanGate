package com.devsecops.fileupload.controller;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/")
public class FileController {

    // Upload folder path
    private final String uploadDir =
            System.getProperty("user.dir") + "/uploads/";

    // Health Check API
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {

        Map<String, String> response = new HashMap<>();

        response.put("status", "UP");
        response.put("service", "fileupload-app");

        return ResponseEntity.ok(response);
    }

    // Upload File API
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
            @RequestParam("file") MultipartFile file) throws IOException {

        // Create uploads folder if missing
        File directory = new File(uploadDir);

        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Get filename
        String filename = file.getOriginalFilename();

        // Destination path
        File dest = new File(uploadDir + filename);

        // Save file
        file.transferTo(dest);

        // Response
        Map<String, String> response = new HashMap<>();

        response.put("message", "File uploaded successfully");
        response.put("filename", filename);

        return ResponseEntity.ok(response);
    }

    // Download File API
    @GetMapping("/files/{filename}")
    public ResponseEntity<Resource> getFile(
            @PathVariable String filename) throws IOException {

        Path filePath =
                Paths.get(uploadDir).resolve(filename);

        Resource resource =
                new UrlResource(filePath.toUri());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    // List Uploaded Files API
    @GetMapping("/list-files")
    public ResponseEntity<List<String>> listFiles() {

        File folder = new File(uploadDir);

        File[] files = folder.listFiles();

        List<String> filenames = new ArrayList<>();

        if (files != null) {

            for (File file : files) {

                filenames.add(file.getName());
            }
        }

        return ResponseEntity.ok(filenames);
    }
}