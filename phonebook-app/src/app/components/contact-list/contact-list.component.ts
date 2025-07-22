import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContactService } from '../../services/contact.service';
import { Contact } from '../../model/contact';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.scss']
})
export class ContactListComponent implements OnInit {
  contacts: Contact[] = [];
  searchTerm = '';
  isLoading = false;

  // Avatar colors for consistent styling
  private avatarColors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
    '#eab308', '#22c55e', '#10b981', '#06b6d4', '#3b82f6'
  ];

  constructor(
    private contactService: ContactService,
    private router: Router
    ) {}

  ngOnInit() {
    this.loadContacts();
  }

  loadContacts() {
    this.isLoading = true;
    this.contactService.getContacts().subscribe({
      next: (data) => {
        this.contacts = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.isLoading = false;
      }
    });
  }

  search() {
    if (this.searchTerm.trim() === '') {
      this.loadContacts();
      return;
    }
    
    this.isLoading = true;
    this.contactService.searchContacts(this.searchTerm).subscribe({
      next: (data) => {
        this.contacts = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching contacts:', error);
        this.isLoading = false;
      }
    });
  }

  clearSearch() {
    this.searchTerm = '';
    this.loadContacts();
  }

  // Get consistent avatar color for a contact
  getAvatarColor(name: string): string {
    const index = name.charCodeAt(0) % this.avatarColors.length;
    return this.avatarColors[index];
  }

  // Highlight search terms in text
  highlightSearchTerm(text: string): string {
    if (!this.searchTerm || !text) {
      return text;
    }
    
    const regex = new RegExp(`(${this.escapeRegExp(this.searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  // Escape special regex characters
  private escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // TrackBy function for performance
  trackByContactId(index: number, contact: Contact): any {
    return contact.id || index;
  }

  // Action methods
  callContact(contact: Contact) {
    // Implement call functionality
    window.location.href = `tel:${contact.phoneNumber}`;
  }

  messageContact(contact: Contact) {
    // Implement message functionality
    window.location.href = `sms:${contact.phoneNumber}`;
  }

  editContact(contact: Contact) {
    if (contact.id) {
      this.router.navigate(['/contacts/edit', contact.id]);
    } else {
      console.error('Cannot edit contact without ID');
    }
  }

  shareContact(contact: Contact) {
    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: contact.name,
        text: `Contact: ${contact.name}\nPhone: ${contact.phoneNumber}`,
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support Web Share API
      const shareText = `Contact: ${contact.name}\nPhone: ${contact.phoneNumber}`;
      navigator.clipboard.writeText(shareText).then(() => {
        // Show success message (you might want to use a snackbar here)
        console.log('Contact copied to clipboard');
      });
    }
  }

  deleteContact(contact: Contact) {
    if (!contact.id) return; // Exit if no ID
    
    if (confirm(`Are you sure you want to delete ${contact.name}?`)) {
      this.contactService.deleteContact(contact.id).subscribe(() => {
        this.contacts = this.contacts.filter(c => c.id !== contact.id);
      });
    }
  }

  addNewContact(contact: Contact) {
    if (contact.id) {
      this.router.navigate(['/add-contact']);
    } else {
      console.log('Add new contact');
    }
  
  }
}