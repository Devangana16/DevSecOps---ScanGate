document.addEventListener('DOMContentLoaded', () => {

    const dropZone =
        document.getElementById('drop-zone');

    const fileInput =
        document.getElementById('file-input');

    const browseBtn =
        document.getElementById('browse-btn');

    const uploadProgress =
        document.getElementById('upload-progress');

    const progressBar =
        document.getElementById('progress-bar');

    const progressFilename =
        document.getElementById('progress-filename');

    const progressPercentage =
        document.getElementById('progress-percentage');

    const filesList =
        document.getElementById('files-list');

    const apiStatus =
        document.getElementById('api-status');

    let uploadedFiles = [];

    // Initial API checks
    checkApiStatus();
    loadUploadedFiles();

    // Browse button
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // File input upload
    fileInput.addEventListener('change', (e) => {

        if (e.target.files.length > 0) {

            handleFileUpload(
                e.target.files[0]
            );
        }
    });

    // Drag & Drop Events
    [
        'dragenter',
        'dragover',
        'dragleave',
        'drop'
    ].forEach(eventName => {

        dropZone.addEventListener(
            eventName,
            preventDefaults,
            false
        );
    });

    function preventDefaults(e) {

        e.preventDefault();
        e.stopPropagation();
    }

    [
        'dragenter',
        'dragover'
    ].forEach(eventName => {

        dropZone.addEventListener(
            eventName,
            () => dropZone.classList.add('dragover'),
            false
        );
    });

    [
        'dragleave',
        'drop'
    ].forEach(eventName => {

        dropZone.addEventListener(
            eventName,
            () => dropZone.classList.remove('dragover'),
            false
        );
    });

    // Drop Upload
    dropZone.addEventListener('drop', (e) => {

        const dt = e.dataTransfer;

        const files = dt.files;

        if (files.length > 0) {

            handleFileUpload(files[0]);
        }

    }, false);

    // Uptime Counter
    let uptimeSeconds = 0;

    const uptimeElement =
        document.getElementById('uptime');

    setInterval(() => {

        uptimeSeconds++;

        const h =
            Math.floor(uptimeSeconds / 3600)
                .toString()
                .padStart(2, '0');

        const m =
            Math.floor((uptimeSeconds % 3600) / 60)
                .toString()
                .padStart(2, '0');

        const s =
            (uptimeSeconds % 60)
                .toString()
                .padStart(2, '0');

        if (uptimeElement) {

            uptimeElement.textContent =
                `UPTIME: ${h}:${m}:${s}`;
        }

    }, 1000);

    // Health Check
    async function checkApiStatus() {

        try {

            const response =
                await fetch('/health');

            if (response.ok) {

                const data =
                    await response.json();

                if (data.status === 'UP') {

                    apiStatus.textContent =
                        'ONLINE';
                }

            } else {

                throw new Error(
                    'API Down'
                );
            }

        } catch (error) {

            apiStatus.textContent =
                'OFFLINE';

            showToast(
                'Connection Error',
                'Cannot connect to backend API.',
                'error'
            );
        }
    }

    // Load Uploaded Files
    async function loadUploadedFiles() {

        try {

            const response =
                await fetch('/list-files');

            const files =
                await response.json();

            files.forEach(file => {

                addFileToList(file);
            });

        } catch (error) {

            console.error(
                'Error loading files:',
                error
            );
        }
    }

    // Handle File Upload
    function handleFileUpload(file) {

        uploadProgress.classList.remove(
            'hidden'
        );

        progressFilename.textContent =
            file.name;

        progressBar.style.width = '0%';

        progressPercentage.textContent =
            '0%';

        const formData =
            new FormData();

        formData.append('file', file);

        const xhr =
            new XMLHttpRequest();

        // Upload Progress
        xhr.upload.addEventListener(
            'progress',
            (e) => {

                if (e.lengthComputable) {

                    const percentComplete =
                        Math.round(
                            (e.loaded / e.total) * 100
                        );

                    progressBar.style.width =
                        percentComplete + '%';

                    progressPercentage.textContent =
                        percentComplete + '%';
                }
            }
        );

        // Upload Complete
        xhr.addEventListener('load', () => {

            if (
                xhr.status >= 200 &&
                xhr.status < 300
            ) {

                try {

                    const response =
                        JSON.parse(xhr.responseText);

                    showToast(
                        'Success',
                        `File ${response.filename} uploaded.`,
                        'success'
                    );

                    addFileToList(
                        response.filename
                    );

                } catch (e) {

                    showToast(
                        'Success',
                        'File uploaded successfully.',
                        'success'
                    );

                    addFileToList(file.name);
                }

            } else {

                showToast(
                    'Upload Failed',
                    `Server Error: ${xhr.status}`,
                    'error'
                );

                console.error(
                    xhr.responseText
                );
            }

            setTimeout(() => {

                uploadProgress.classList.add(
                    'hidden'
                );

            }, 2000);

            fileInput.value = '';
        });

        // Upload Error
        xhr.addEventListener('error', () => {

            showToast(
                'Error',
                'Network error occurred.',
                'error'
            );

            uploadProgress.classList.add(
                'hidden'
            );

            fileInput.value = '';
        });

        // Send Request
        xhr.open(
            'POST',
            '/upload',
            true
        );

        xhr.send(formData);
    }

    // Add File To Table
    function addFileToList(filename) {

        const emptyState =
            document.querySelector('.empty-state');

        if (emptyState) {

            emptyState.remove();
        }

        // Prevent duplicates
        if (!uploadedFiles.includes(filename)) {

            uploadedFiles.push(filename);

            const tr =
                document.createElement('tr');

            const ext =
                filename
                    .split('.')
                    .pop()
                    .toLowerCase();

            let icon = 'fa-file';

            if (
                ['jsp', 'php', 'sh', 'exe']
                    .includes(ext)
            ) {

                icon = 'fa-file-code';

            } else if (
                ['pdf']
                    .includes(ext)
            ) {

                icon = 'fa-file-pdf';

            } else if (
                ['jpg', 'png', 'gif', 'svg']
                    .includes(ext)
            ) {

                icon = 'fa-file-image';
            }

            tr.innerHTML = `
                <td>
                    <div style="
                        display:flex;
                        align-items:center;
                        gap:0.75rem;
                    ">
                        <i class="fa-solid ${icon}"
                           style="color: var(--primary);">
                        </i>

                        <span style="
                            color: var(--text-main);
                        ">
                            ${filename}
                        </span>
                    </div>
                </td>

                <td>
                    <span style="
                        color: var(--primary);
                        font-size: 0.85rem;
                    ">
                        [ OK ]
                    </span>
                </td>

                <td>
                    <a href="/files/${encodeURIComponent(filename)}"
                       target="_blank"
                       class="btn-action">

                       > execute

                    </a>
                </td>
            `;

            filesList.insertBefore(
                tr,
                filesList.firstChild
            );
        }
    }

    // Toast Notification
    function showToast(
        title,
        message,
        type = 'success'
    ) {

        const toastContainer =
            document.getElementById(
                'toast-container'
            );

        const toast =
            document.createElement('div');

        toast.className =
            `toast ${type}`;

        const icon =
            type === 'success'
                ? 'fa-check-circle'
                : 'fa-triangle-exclamation';

        toast.innerHTML = `
            <i class="fa-solid ${icon}"></i>

            <div class="toast-content">

                <h4>${title}</h4>

                <p>${message}</p>

            </div>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {

            toast.style.animation =
                'slideOut 0.3s ease forwards';

            setTimeout(() => {

                toast.remove();

            }, 300);

        }, 4000);
    }
});