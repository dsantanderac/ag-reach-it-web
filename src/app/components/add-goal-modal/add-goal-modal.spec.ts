import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGoalModal } from './add-goal-modal';

describe('AddGoalModal', () => {
  let component: AddGoalModal;
  let fixture: ComponentFixture<AddGoalModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddGoalModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddGoalModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
