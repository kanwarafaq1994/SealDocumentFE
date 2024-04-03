import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-image-preview-modal',
  templateUrl: './image-preview-modal.component.html',
  styleUrl: './image-preview-modal.component.css'
})
export class ImagePreviewModalComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}
