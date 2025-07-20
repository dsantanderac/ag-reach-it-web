import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { FamilyService } from './family';
import { Family } from '../models/family.model';

describe('FamilyService', () => {
  let service: FamilyService;
  let http: jasmine.SpyObj<HttpClient>;

  const mockFamilies: Family[] = [
    {
      name: 'Doe Family',
      headId: '1',
      members: ['1', '2'],
    },
    {
      name: 'Smith Family',
      headId: '3',
      members: ['3', '4', '5'],
    },
  ];

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpClient', ['get']);

    TestBed.configureTestingModule({
      providers: [FamilyService, { provide: HttpClient, useValue: httpSpy }],
    });

    service = TestBed.inject(FamilyService);
    http = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;

    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initFamilies', () => {
    it('should return existing families from localStorage if available', async () => {
      localStorage.setItem('families', JSON.stringify(mockFamilies));

      await service.initFamilies();

      expect(http.get).not.toHaveBeenCalled();
    });

    it('should fetch families from API if localStorage is empty', async () => {
      http.get.and.returnValue(of(mockFamilies));
      spyOn(localStorage, 'setItem');

      await service.initFamilies();

      expect(http.get).toHaveBeenCalledWith(
        'https://dsantanderac.github.io/reach-it-data/families.json'
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'families',
        JSON.stringify(mockFamilies)
      );
    });

    it('should handle API error and set empty array', async () => {
      const error = new Error('Network error');
      http.get.and.returnValue(throwError(() => error));
      spyOn(localStorage, 'setItem');
      spyOn(console, 'error');

      await service.initFamilies();

      expect(http.get).toHaveBeenCalledWith(
        'https://dsantanderac.github.io/reach-it-data/families.json'
      );
      expect(console.error).toHaveBeenCalledWith(
        'error fetching families',
        error
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'families',
        JSON.stringify([])
      );
    });
  });

  describe('getFamilies', () => {
    it('should return families from localStorage', () => {
      localStorage.setItem('families', JSON.stringify(mockFamilies));

      const result = service.getFamilies();

      expect(result).toEqual(mockFamilies);
    });

    it('should return empty array if no families in localStorage', () => {
      const result = service.getFamilies();

      expect(result).toEqual([]);
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('families', 'invalid-json');

      expect(() => service.getFamilies()).toThrow();
    });
  });

  describe('addFamily', () => {
    it('should add new family to existing families', () => {
      localStorage.setItem('families', JSON.stringify(mockFamilies));
      const newFamily: Family = {
        name: 'Johnson Family',
        headId: '6',
        members: ['6', '7'],
      };

      service.addFamily(newFamily);

      const updatedFamilies = JSON.parse(
        localStorage.getItem('families') || '[]'
      );
      expect(updatedFamilies).toContain(newFamily);
      expect(updatedFamilies.length).toBe(3);
    });

    it('should create new families array if none exists', () => {
      const newFamily: Family = {
        name: 'Brown Family',
        headId: '8',
        members: ['8'],
      };

      service.addFamily(newFamily);

      const families = JSON.parse(localStorage.getItem('families') || '[]');
      expect(families).toEqual([newFamily]);
    });

    it('should preserve existing families when adding new one', () => {
      localStorage.setItem('families', JSON.stringify([mockFamilies[0]]));
      const newFamily = mockFamilies[1];

      service.addFamily(newFamily);

      const updatedFamilies = JSON.parse(
        localStorage.getItem('families') || '[]'
      );
      expect(updatedFamilies).toContain(mockFamilies[0]);
      expect(updatedFamilies).toContain(newFamily);
      expect(updatedFamilies.length).toBe(2);
    });

    it('should handle family with multiple members', () => {
      const familyWithMultipleMembers: Family = {
        name: 'Large Family',
        headId: '9',
        members: ['9', '10', '11', '12', '13'],
      };

      service.addFamily(familyWithMultipleMembers);

      const families = JSON.parse(localStorage.getItem('families') || '[]');
      expect(families).toContain(familyWithMultipleMembers);
      expect(families[0].members.length).toBe(5);
    });
  });

  describe('integration tests', () => {
    it('should handle complete family lifecycle', () => {
      // Initially no families
      expect(service.getFamilies()).toEqual([]);

      // Add first family
      service.addFamily(mockFamilies[0]);
      expect(service.getFamilies()).toEqual([mockFamilies[0]]);

      // Add second family
      service.addFamily(mockFamilies[1]);
      expect(service.getFamilies()).toEqual(mockFamilies);

      // Verify localStorage persistence
      const storedFamilies = JSON.parse(
        localStorage.getItem('families') || '[]'
      );
      expect(storedFamilies).toEqual(mockFamilies);
    });

    it('should handle multiple service instances', () => {
      // Add family with first instance
      service.addFamily(mockFamilies[0]);

      // Create new service instance
      const newService = TestBed.inject(FamilyService);

      // Should see the same families
      expect(newService.getFamilies()).toEqual([mockFamilies[0]]);
    });

    it('should maintain family structure integrity', () => {
      const testFamily: Family = {
        name: 'Test Family',
        headId: 'test-head-id',
        members: ['test-head-id', 'member-1', 'member-2'],
      };

      service.addFamily(testFamily);

      const retrievedFamily = service.getFamilies()[0];
      expect(retrievedFamily.name).toBe(testFamily.name);
      expect(retrievedFamily.headId).toBe(testFamily.headId);
      expect(retrievedFamily.members).toEqual(testFamily.members);
      expect(retrievedFamily.members).toContain(testFamily.headId);
    });
  });

  describe('edge cases', () => {
    it('should handle empty family members array', () => {
      const emptyFamily: Family = {
        name: 'Empty Family',
        headId: 'empty-head',
        members: [],
      };

      service.addFamily(emptyFamily);

      const families = service.getFamilies();
      expect(families[0].members).toEqual([]);
    });

    it('should handle family with only head as member', () => {
      const singleMemberFamily: Family = {
        name: 'Single Member Family',
        headId: 'single-head',
        members: ['single-head'],
      };

      service.addFamily(singleMemberFamily);

      const families = service.getFamilies();
      expect(families[0].members).toEqual(['single-head']);
      expect(families[0].members.length).toBe(1);
    });

    it('should handle special characters in family name', () => {
      const specialNameFamily: Family = {
        name: 'Family with Special Chars: @#$%^&*()',
        headId: 'special-head',
        members: ['special-head'],
      };

      service.addFamily(specialNameFamily);

      const families = service.getFamilies();
      expect(families[0].name).toBe('Family with Special Chars: @#$%^&*()');
    });
  });
});
