import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Family } from '../models/family.model';

@Injectable({ providedIn: 'root' })
export class FamilyService {
  constructor(private http: HttpClient) {}

  async initFamilies(): Promise<void> {
    const localFamilies = localStorage.getItem('families');
    if (localFamilies) {
      return JSON.parse(localFamilies);
    } else {
      this.http
        .get<Family[]>(
          'https://dsantanderac.github.io/reach-it-data/families.json'
        )
        .subscribe({
          next: (familiesFetched) => {
            localStorage.setItem('families', JSON.stringify(familiesFetched));
          },
          error: (e) => {
            console.error('error fetching families', e);
            localStorage.setItem('families', JSON.stringify([]));
          },
        });
    }
  }

  getFamilies(): Family[] {
    const localFamilies = localStorage.getItem('families');
    return localFamilies ? JSON.parse(localFamilies) : [];
  }

  addFamily(family: Family): void {
    const families = this.getFamilies();
    families.push(family);
    localStorage.setItem('families', JSON.stringify(families));
  }
}
