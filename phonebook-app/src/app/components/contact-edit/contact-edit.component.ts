import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ContactService } from '../../services/contact.service';
import { Contact } from '../../model/contact';

@Component({
  selector: 'app-contact-edit',
  templateUrl: './contact-edit.component.html',
  styleUrls: ['./contact-edit.component.scss']
})
export class ContactEditComponent implements OnInit {
  contactForm: FormGroup;
  isEditMode = false;
  contactId: number | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.contactForm = this.fb.group({
      id: [0],
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
  
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode by looking for an ID parameter
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.contactId = +params['id'];
        this.loadContact(this.contactId);
      }
    });
  }

  private loadContact(id: number): void {
    this.isLoading = true;
    this.contactService.getContact(id).subscribe({
      next: (contact: Contact) => {
        this.contactForm.patchValue(contact);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load contact details';
        this.isLoading = false;
        console.error('Error loading contact:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.contactForm.value;

    if (this.isEditMode) {
      // Update existing contact
      this.contactService.updateContact(formValue).subscribe({
        next: (updatedContact: Contact) => {
          this.successMessage = 'Contact updated successfully!';
          this.isLoading = false;
          setTimeout(() => {
            this.router.navigate(['/contacts']);
          }, 2000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to update contact. Please try again.';
          this.isLoading = false;
          console.error('Error updating contact:', error);
        }
      });
    } else {
      // Create new contact
      const contact: Contact = {
        id: 0, // Will be assigned by the server
        name: formValue.name,
        email: formValue.email,
        phoneNumber: formValue.phone,
      };

      this.contactService.addContact(contact).subscribe({
        next: (newContact: Contact) => {
          this.successMessage = 'Contact created successfully!';
          this.isLoading = false;
          setTimeout(() => {
            this.router.navigate(['/contacts']);
          }, 2000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to create contact. Please try again.';
          this.isLoading = false;
          console.error('Error creating contact:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/contacts']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods for template
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
    }
    return '';
  }
}