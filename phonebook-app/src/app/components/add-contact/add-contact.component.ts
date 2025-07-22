import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { ContactService } from '../../services/contact.service';
import { Contact } from '../../model/contact';


@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.component.html',
  styleUrls: ['./add-contact.component.scss']
})
export class AddContactComponent implements OnInit, OnDestroy {
  @Output() contactAdded = new EventEmitter<Contact>();
  @Output() cancelled = new EventEmitter<void>();

  contactForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private contactService: ContactService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.contactForm = this.createForm();
  }

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[+]?[\d\s\-\(\)]+$/)]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid phone number';
      }
    }
    
    return '';
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const contactData: Contact = this.contactForm.value;

      this.contactService.addContact(contactData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (savedContact) => {
            this.successMessage = 'Contact added successfully!';
            this.contactAdded.emit(savedContact);
            this.resetForm();
            
            this.snackBar.open('Contact added successfully!', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            
            this.isLoading = false;
            setTimeout(() => {
              this.router.navigate(['/contacts']);
            }, 2000);
          },
          error: (error) => {
            console.error('Error adding contact:', error);
            this.errorMessage = error?.error?.message || 'Failed to add contact. Please try again.';
            this.isLoading = false;
          }
        });
    }
  }

  onCancel(): void {
    this.resetForm();
    this.cancelled.emit();
    this.router.navigate(['/contacts']);
  }

  private resetForm(): void {
    this.contactForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }
}