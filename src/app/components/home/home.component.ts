import { Component } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';
import { MatDialog } from '@angular/material/dialog';
import { ImagePreviewModalComponent } from '../image-preview-modal/image-preview-modal.component';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  fileInput: any;
  modalService: any;
  viewportScroller: any;

  constructor(private http: HttpClient, public apiService: ApiService, private router: Router, public notificationsService: NotificationsService, public dialog: MatDialog) { }

  // Private document variables initialize
  files = [];
  selectedFiles: FileList | null = null; // Stores selected files
  uploadProgress: number = 0; // Used to track upload progress
  currentPage: number = 1;
  itemsPerPage: number = 5; // Adjust based on your requirement
  pagedItems: any[] = [];
  // Public document variables initialize 
  publicFiles = [];
  currentPublicPage: number = 1;
  publicPagedItems: any[] = [];

  ngOnInit() {
    this.getUserDocuments(); // Initialize the paged items with the first page
    this.getPublicUserDocuments(); // Initialize the paged items with the first page
  }

  openModal(imageUrl: string): void {
    let fileExt = this.getFileExtension(imageUrl);
    let srcurl = '';
    if (fileExt === 'doc' || fileExt === 'docx') srcurl = '../../../assets/docx.png'
    if (fileExt === 'pdf') srcurl = '../../../assets/pdf.png'
    if (fileExt === 'txt') srcurl = '../../../assets/txt.png'
    if (fileExt === 'xls') srcurl = '../../../assets/xls.png'
    if (fileExt === 'jpg' || fileExt === 'jpeg' || fileExt === 'png' || fileExt === 'gif') srcurl = '../../../assets/img.png'
    const dialogRef = this.dialog.open(ImagePreviewModalComponent, {
      data: { imageUrl: srcurl }
    });
  }

  handleFileSelection(event: any): void {
    this.selectedFiles = event.target.files;
  }

  uploadSelectedFiles(): void {
    if (this.selectedFiles && this.selectedFiles.length > 0) {
      const formData = new FormData();

      Array.from(this.selectedFiles).forEach((file, index) => {
        // Append each file under a unique key, e.g., 'files[]'
        formData.append(`files`, file);
        formData.append(`fileType`, file.type);
      });

      // Make a single HTTP request to upload all files
      this.http.post('https://localhost:44325/api/Document', formData, {
        reportProgress: true,
        observe: 'events'
      }).subscribe((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            if (event.total) {
              const overallProgress = Math.round(100 * event.loaded / event.total);
              console.log(`Overall upload progress: ${overallProgress}%`);
              // Update the overall progress variable
              this.uploadProgress = overallProgress;
            }
            break;
          case HttpEventType.Response:
            console.log('All files uploaded successfully', event.body);
            this.displayErrorMessages(event.body);
            // this.notificationsService.success('Success!', "Documenty has been uploaded Sucessfully.");
            // Handle successful upload here, reset the progress indicator
            this.uploadProgress = 0;
            this.resetUpload();
            this.getUserDocuments();
            break;
        }
      }, (error) => {
        console.error('Upload error', error);
        this.notificationsService.error('Error!', error.error.message);
        // Handle error here, reset the progress indicator
        this.uploadProgress = 0;
      });
    }
  }

  displayErrorMessages(errors: any[]): void {
    errors.forEach(error => {
      // Assuming each 'message' is an array of strings as per your example
      error.message.forEach((msg: string) => {
        this.notificationsService.info('Info!', msg);
      });
    });
  }

  resetUpload(): void {
    // Reset the selected files
    this.selectedFiles = null;

    // Reset the file input form
    if (this.fileInput) {
      this.fileInput.nativeElement.value = "";
    }

    // Reset any upload progress indicators
    this.uploadProgress = 0;
  }

  getUserDocuments() {
    let userInfo: any = localStorage.getItem('documentmanagement');
    this.apiService.getUserDocuments(JSON.parse(userInfo).userId).subscribe({
      next: (res: any) => {
        this.files = res;
        this.pageChanged(1);
      },
      error: (error: any) => {
      }
    });
  }

  getPublicUserDocuments() {
    this.apiService.getPublicUserDocuments().subscribe({
      next: (res: any) => {
        this.publicFiles = res;
        this.publicPageChanged(1);
      },
      error: (error: any) => {
      }
    });
  }

  getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts[parts.length - 1].toLowerCase();
  }

  downloadDocument(id: any, name: ""): void {
    const url = `https://localhost:44325/api/Document/${id}`;

    this.http.get(url, { responseType: 'blob' }).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = window.URL.createObjectURL(blob);

      a.href = objectUrl;
      a.download = name; // Setting a filename is important
      document.body.appendChild(a); // Append the anchor to the body
      a.click();

      document.body.removeChild(a); // Clean up by removing the anchor
      window.URL.revokeObjectURL(objectUrl); // Clean up the object URL
      this.notificationsService.info('Info!', "File has been downloaded successfully.")
      this.getUserDocuments();
      this.getPublicUserDocuments();
    }, error => {
      console.error('Download error:', error);
      this.notificationsService.error('Error!', "An Error accuredan during the processing.Please try again later.")
    });
  }

  shareDocument(id: any): void {
    this.apiService.shareDocument(id).subscribe({
      next: (res: any) => {
        this.getUserDocuments()
        this.getPublicUserDocuments();
        this.notificationsService.success('Success!', res.message);
      },
      error: (error: any) => {
        this.notificationsService.error('Error!', error.error.message);
      }
    });
  }

  logout() {
    localStorage.removeItem("documentmanagement");
    this.router.navigate(['/login']);
  }

  // Pagination for private document

  pageChanged(newPage: number) {
    console.log(newPage)
    this.currentPage = newPage;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    this.pagedItems = this.files.slice(startIndex, endIndex);
  }

  get totalPages() {
    return Math.ceil(this.files.length / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const pagesToShow = 3; // You can adjust this number
    let startPage: number, endPage: number;

    if (this.totalPages <= pagesToShow) {
      // Show all pages
      startPage = 1;
      endPage = this.totalPages;
    } else {
      // Calculate which pages to show
      if (this.currentPage <= 2) {
        startPage = 1;
        endPage = pagesToShow;
      } else if (this.currentPage + 1 >= this.totalPages) {
        startPage = this.totalPages - (pagesToShow - 1);
        endPage = this.totalPages;
      } else {
        startPage = this.currentPage - 1;
        endPage = this.currentPage + 1;
      }
    }
    return Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);
  }

  // Pagination for public document

  publicPageChanged(newPage: number) {
    console.log(newPage)
    this.currentPublicPage = newPage;
    const startIndex = (this.currentPublicPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    this.publicPagedItems = this.publicFiles.slice(startIndex, endIndex);
  }

  get totalPublicPages() {
    return Math.ceil(this.publicFiles.length / this.itemsPerPage);
  }

  get publicPageNumbers(): number[] {
    const pagesToShow = 3; // You can adjust this number
    let startPage: number, endPage: number;

    if (this.totalPublicPages <= pagesToShow) {
      // Show all pages
      startPage = 1;
      endPage = this.totalPublicPages;
    } else {
      // Calculate which pages to show
      if (this.currentPublicPage <= 2) {
        startPage = 1;
        endPage = pagesToShow;
      } else if (this.currentPublicPage + 1 >= this.totalPublicPages) {
        startPage = this.totalPublicPages - (pagesToShow - 1);
        endPage = this.totalPublicPages;
      } else {
        startPage = this.currentPublicPage - 1;
        endPage = this.currentPublicPage + 1;
      }
    }
    return Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);
  }

  scrollToPrivateDocuments() {
    document.getElementById('privateDocuments')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToPublicDocuments() {
    document.getElementById('publicDocuments')?.scrollIntoView({ behavior: 'smooth' });
  }
}