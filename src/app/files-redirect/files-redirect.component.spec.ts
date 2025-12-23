import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesRedirectComponent } from './files-redirect.component';

describe('FilesRedirectComponent', () => {
  let component: FilesRedirectComponent;
  let fixture: ComponentFixture<FilesRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilesRedirectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilesRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
