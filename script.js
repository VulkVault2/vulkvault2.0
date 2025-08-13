// Clock functionality (12-hour format)
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
    document.getElementById('am-pm').textContent = ampm;
}

// Update clock every second
updateClock();
setInterval(updateClock, 1000);

// Data storage with localStorage persistence
let vaultData = JSON.parse(localStorage.getItem('vaultData')) || {
    photos: [],
    videos: [],
    audio: [],
    urls: [],
    documents: []
};

function saveData() {
    localStorage.setItem('vaultData', JSON.stringify(vaultData));
}

// Section switching
const sectionBtns = document.querySelectorAll('.section-btn');
const contentSections = document.querySelectorAll('.content-section');

sectionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons and sections
        sectionBtns.forEach(b => b.classList.remove('active'));
        contentSections.forEach(section => section.classList.remove('active'));
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Show corresponding section
        const sectionId = btn.getAttribute('data-section') + '-section';
        document.getElementById(sectionId).classList.add('active');
    });
});

// Modal functionality
const uploadBtn = document.getElementById('uploadBtn');
const refreshBtn = document.getElementById('refreshBtn');
const uploadModal = document.getElementById('uploadModal');
const viewModal = document.getElementById('viewModal');
const closeModals = document.querySelectorAll('.close-modal');
const fileTypeSelect = document.getElementById('fileType');
const fileUploadGroup = document.getElementById('fileUploadGroup');
const urlInputGroup = document.getElementById('urlInputGroup');
const fileUploadArea = document.getElementById('fileUploadArea');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');

// Show upload modal when upload button is clicked
uploadBtn.addEventListener('click', () => {
    uploadModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
});

// Refresh data
refreshBtn.addEventListener('click', () => {
    renderAllSections();
});

// Close modals when X is clicked
closeModals.forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        uploadModal.style.display = 'none';
        viewModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
});

// Close modals when clicking outside the modal content
[uploadModal, viewModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
});

// Show/hide file upload or URL input based on selection
fileTypeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'url') {
        fileUploadGroup.style.display = 'none';
        urlInputGroup.style.display = 'flex';
    } else {
        fileUploadGroup.style.display = 'flex';
        urlInputGroup.style.display = 'none';
    }
});

// File upload area click handler
fileUploadArea.addEventListener('click', () => {
    fileInput.click();
});

// File input change handler
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        fileName.textContent = e.target.files[0].name;
        fileName.style.display = 'block';
        fileUploadArea.querySelector('p').textContent = 'File selected';
    } else {
        fileName.style.display = 'none';
        fileUploadArea.querySelector('p').textContent = 'Drag & drop your file here or click to browse';
    }
});

// Drag and drop functionality
fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = 'var(--primary-color)';
    fileUploadArea.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
});

fileUploadArea.addEventListener('dragleave', () => {
    fileUploadArea.style.borderColor = '#ddd';
    fileUploadArea.style.backgroundColor = 'transparent';
});

fileUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadArea.style.borderColor = '#ddd';
    fileUploadArea.style.backgroundColor = 'transparent';
    
    if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        fileName.textContent = e.dataTransfer.files[0].name;
        fileName.style.display = 'block';
        fileUploadArea.querySelector('p').textContent = 'File selected';
    }
});

// Function to create a photo item
function createPhotoItem(item) {
    return `
        <div class="item" data-id="${item.id}" data-type="photo">
            <img src="${item.fileData}" alt="${item.title}" class="item-thumbnail">
            <div class="item-info">
                <div class="item-title">${item.title}</div>
                <div class="item-description">${item.description || ''}</div>
                <div class="item-date">${item.date}</div>
            </div>
            <div class="item-actions">
                <button class="action-btn view-btn" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn delete-btn" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// Function to create a video item
function createVideoItem(item) {
    return `
        <div class="item" data-id="${item.id}" data-type="video">
            <video class="item-thumbnail" poster="https://via.placeholder.com/240x160?text=Video" controls>
                <source src="${item.fileData}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <div class="item-info">
                <div class="item-title">${item.title}</div>
                <div class="item-description">${item.description || ''}</div>
                <div class="item-date">${item.date}</div>
            </div>
            <div class="item-actions">
                <button class="action-btn view-btn" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn delete-btn" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// Function to create an audio item
function createAudioItem(item) {
    return `
        <div class="item" data-id="${item.id}" data-type="audio">
            <div class="item-thumbnail" style="display: flex; justify-content: center; align-items: center; background: #f0f0f0;">
                <i class="fas fa-music" style="font-size: 3rem; color: var(--primary-color);"></i>
            </div>
            <div class="item-info">
                <div class="item-title">${item.title}</div>
                <div class="item-description">${item.description || ''}</div>
                <div class="item-date">${item.date}</div>
            </div>
            <audio src="${item.fileData}" controls style="width: 100%; margin-top: 10px;"></audio>
            <div class="item-actions">
                <button class="action-btn view-btn" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn delete-btn" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// Function to create a URL item
function createUrlItem(item) {
    return `
        <div class="item" data-id="${item.id}" data-type="url">
            <div class="url-item">
                <div class="url-icon">
                    <i class="fas fa-link"></i>
                </div>
                <div class="item-title">${item.title}</div>
                <div class="item-description">${item.url}</div>
                <div class="item-date">${item.date}</div>
            </div>
            <div class="item-actions">
                <button class="action-btn view-btn" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn delete-btn" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
                <a href="${item.url}" class="action-btn" title="Open" target="_blank">
                    <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        </div>
    `;
}

// Function to create a document item
function createDocumentItem(item) {
    const fileIcon = item.fileType === 'pdf' ? 'file-pdf' : 
                     item.fileType === 'doc' || item.fileType === 'docx' ? 'file-word' :
                     item.fileType === 'xls' || item.fileType === 'xlsx' ? 'file-excel' :
                     item.fileType === 'ppt' || item.fileType === 'pptx' ? 'file-powerpoint' :
                     item.fileType === 'txt' ? 'file-alt' :
                     'file';
    
    return `
        <div class="item" data-id="${item.id}" data-type="document">
            <div class="item-thumbnail" style="display: flex; justify-content: center; align-items: center; background: #f0f0f0;">
                <i class="fas fa-${fileIcon}" style="font-size: 3rem; color: var(--primary-color);"></i>
            </div>
            <div class="item-info">
                <div class="item-title">${item.title}</div>
                <div class="item-description">${item.description || ''}</div>
                <div class="item-date">${item.date}</div>
                <div style="margin-top: 5px; font-size: 0.8rem; color: var(--text-light);">
                    ${item.fileType.toUpperCase()} • ${formatFileSize(item.fileSize)}
                </div>
            </div>
            <div class="item-actions">
                <button class="action-btn view-btn" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn delete-btn" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
                <a href="${item.fileData}" class="action-btn" title="Download" download="${item.title}.${item.fileType}">
                    <i class="fas fa-download"></i>
                </a>
            </div>
        </div>
    `;
}

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}

// Function to render items for a section
function renderSection(section, items) {
    const grid = document.getElementById(`${section}-grid`);
    
    if (items.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-${getSectionIcon(section)}"></i>
                <h3>No ${section} found</h3>
                <p>${getEmptyStateMessage(section)}</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = '';
    
    items.forEach(item => {
        let itemHTML = '';
        
        switch(section) {
            case 'photos':
                itemHTML = createPhotoItem(item);
                break;
            case 'videos':
                itemHTML = createVideoItem(item);
                break;
            case 'audio':
                itemHTML = createAudioItem(item);
                break;
            case 'urls':
                itemHTML = createUrlItem(item);
                break;
            case 'documents':
                itemHTML = createDocumentItem(item);
                break;
        }
        
        grid.innerHTML += itemHTML;
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = e.target.closest('.item');
            const itemId = item.getAttribute('data-id');
            const itemType = item.getAttribute('data-type');
            viewItem(itemId, itemType);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const item = e.target.closest('.item');
            const itemId = item.getAttribute('data-id');
            const itemType = item.getAttribute('data-type');
            deleteItem(itemId, itemType);
        });
    });
}

function getSectionIcon(section) {
    switch(section) {
        case 'photos': return 'image';
        case 'videos': return 'video';
        case 'audio': return 'music';
        case 'urls': return 'link';
        case 'documents': return 'file-alt';
        default: return 'file';
    }
}

function getEmptyStateMessage(section) {
    switch(section) {
        case 'photos': return 'Upload your first photo to get started';
        case 'videos': return 'Upload your first video to get started';
        case 'audio': return 'Upload your first audio file to get started';
        case 'urls': return 'Save your first URL to get started';
        case 'documents': return 'Upload your first document to get started';
        default: return 'Add your first item to get started';
    }
}

// Function to render all sections
function renderAllSections() {
    Object.keys(vaultData).forEach(section => {
        renderSection(section, vaultData[section]);
    });
}

// View item in modal
function viewItem(itemId, itemType) {
    const item = vaultData[itemType + 's'].find(i => i.id === itemId);
    if (!item) return;
    
    const viewModalTitle = document.getElementById('viewModalTitle');
    const viewModalContent = document.getElementById('viewModalContent');
    
    viewModalTitle.textContent = item.title;
    
    let contentHTML = '';
    
    switch(itemType) {
        case 'photo':
            contentHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${item.fileData}" alt="${item.title}" style="max-width: 100%; max-height: 400px; border-radius: 8px;">
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Description:</strong> ${item.description || 'None'}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Date Added:</strong> ${item.date}
                </div>
            `;
            break;
            
        case 'video':
            contentHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <video controls style="max-width: 100%; max-height: 400px; border-radius: 8px;">
                        <source src="${item.fileData}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Description:</strong> ${item.description || 'None'}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Date Added:</strong> ${item.date}
                </div>
            `;
            break;
            
        case 'audio':
            contentHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <audio controls style="width: 100%;">
                        <source src="${item.fileData}" type="audio/mpeg">
                        Your browser does not support the audio element.
                    </audio>
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Description:</strong> ${item.description || 'None'}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Date Added:</strong> ${item.date}
                </div>
            `;
            break;
            
        case 'url':
            contentHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <i class="fas fa-link" style="font-size: 3rem; color: var(--primary-color);"></i>
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>URL:</strong> <a href="${item.url}" target="_blank">${item.url}</a>
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Description:</strong> ${item.description || 'None'}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Date Added:</strong> ${item.date}
                </div>
                <div style="margin-top: 20px; text-align: center;">
                    <a href="${item.url}" target="_blank" class="btn btn-primary" style="text-decoration: none;">
                        <i class="fas fa-external-link-alt"></i> Open URL
                    </a>
                </div>
            `;
            break;
            
        case 'document':
            contentHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <i class="fas fa-file-alt" style="font-size: 3rem; color: var(--primary-color);"></i>
                    <div style="margin-top: 10px;">
                        ${item.fileType.toUpperCase()} • ${formatFileSize(item.fileSize)}
                    </div>
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Description:</strong> ${item.description || 'None'}
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Date Added:</strong> ${item.date}
                </div>
                <div style="margin-top: 20px; text-align: center;">
                    <a href="${item.fileData}" download="${item.title}.${item.fileType}" class="btn btn-primary" style="text-decoration: none;">
                        <i class="fas fa-download"></i> Download Document
                    </a>
                </div>
            `;
            break;
    }
    
    viewModalContent.innerHTML = contentHTML;
    viewModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Delete item
function deleteItem(itemId, itemType) {
    if (confirm('Are you sure you want to delete this item?')) {
        vaultData[itemType + 's'] = vaultData[itemType + 's'].filter(i => i.id !== itemId);
        saveData();
        renderAllSections();
    }
}

// Form submission
const uploadForm = document.getElementById('uploadForm');
const urlInput = document.getElementById('urlInput');
const itemTitle = document.getElementById('itemTitle');
const itemDescription = document.getElementById('itemDescription');

uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const fileType = fileTypeSelect.value;
    const title = itemTitle.value;
    const description = itemDescription.value;
    const date = new Date().toLocaleDateString();
    const id = Date.now().toString();
    
    if (fileType === 'url') {
        // Handle URL
        const url = urlInput.value;
        
        if (!url) {
            alert('Please enter a valid URL');
            return;
        }
        
        vaultData.urls.push({
            id,
            title,
            description,
            date,
            url
        });
        
        saveData();
        renderSection('urls', vaultData.urls);
    } else {
        // Handle file upload
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Please select a file');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const fileData = e.target.result;
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const fileSize = file.size;
            
            const newItem = {
                id,
                title: title || file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                description,
                date,
                fileData,
                fileType: fileExtension,
                fileSize
            };
            
            switch(fileType) {
                case 'photo':
                    vaultData.photos.push(newItem);
                    renderSection('photos', vaultData.photos);
                    break;
                case 'video':
                    vaultData.videos.push(newItem);
                    renderSection('videos', vaultData.videos);
                    break;
                case 'audio':
                    vaultData.audio.push(newItem);
                    renderSection('audio', vaultData.audio);
                    break;
                case 'document':
                    vaultData.documents.push(newItem);
                    renderSection('documents', vaultData.documents);
                    break;
            }
            
            saveData();
        };
        
        reader.readAsDataURL(file);
    }
    
    // Reset form and close modal
    uploadForm.reset();
    fileName.style.display = 'none';
    fileUploadArea.querySelector('p').textContent = 'Drag & drop your file here or click to browse';
    uploadModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Show file upload by default
    fileUploadGroup.style.display = 'flex';
    urlInputGroup.style.display = 'none';
});

// Search functionality
const searchInput = document.getElementById('searchInput');
const searchIcon = document.getElementById('searchIcon');

function searchItems(query) {
    query = query.toLowerCase().trim();
    
    if (!query) {
        renderAllSections();
        return;
    }
    
    Object.keys(vaultData).forEach(section => {
        const filteredItems = vaultData[section].filter(item => 
            item.title.toLowerCase().includes(query) || 
            (item.description && item.description.toLowerCase().includes(query)) ||
            (section === 'urls' && item.url.toLowerCase().includes(query))
        );
        
        renderSection(section, filteredItems);
    });
}

searchInput.addEventListener('input', (e) => {
    searchItems(e.target.value);
});

searchIcon.addEventListener('click', () => {
    searchItems(searchInput.value);
});

// Initialize the app with sample data if empty
function initializeSampleData() {
    let needsSampleData = Object.values(vaultData).every(arr => arr.length === 0);
    
    if (needsSampleData) {
        vaultData.photos.push({
            id: '1',
            title: "Mountain View",
            description: "Beautiful mountain landscape",
            date: new Date().toLocaleDateString(),
            fileData: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500",
            fileType: "jpg",
            fileSize: 102400
        });

        vaultData.videos.push({
            id: '2',
            title: "Ocean Waves",
            description: "Relaxing ocean waves video",
            date: new Date().toLocaleDateString(),
            fileData: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
            fileType: "mp4",
            fileSize: 1048576
        });

        vaultData.audio.push({
            id: '3',
            title: "Relaxing Music",
            description: "Calm piano music for meditation",
            date: new Date().toLocaleDateString(),
            fileData: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            fileType: "mp3",
            fileSize: 512000
        });

        vaultData.urls.push({
            id: '4',
            title: "Google",
            description: "The most popular search engine",
            date: new Date().toLocaleDateString(),
            url: "https://google.com"
        });

        vaultData.documents.push({
            id: '5',
            title: "Sample PDF",
            description: "Example PDF document",
            date: new Date().toLocaleDateString(),
            fileData: "https://www.africau.edu/images/default/sample.pdf",
            fileType: "pdf",
            fileSize: 204800
        });
        
        saveData();
    }
}

// Initialize the app
initializeSampleData();
renderAllSections();
