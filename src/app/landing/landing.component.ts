import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  setupForm: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.setupForm = formBuilder.group({
      noOfQuestions: [10, Validators.compose([Validators.required])],
      category: ['any', Validators.compose([Validators.required])],
      difficulty: ['any', Validators.compose([Validators.required])],
    });
  }

  ngOnInit() {
  }

  submit() {
    localStorage.setItem('noOfQuestions', this.setupForm.controls.noOfQuestions.value);
    localStorage.setItem('category', this.setupForm.controls.category.value);
    localStorage.setItem('difficulty', this.setupForm.controls.difficulty.value);
  }
}
