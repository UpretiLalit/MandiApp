import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogisticsPage } from './logistics.page';

describe('LogisticsPage', () => {
  let component: LogisticsPage;
  let fixture: ComponentFixture<LogisticsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LogisticsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
