import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  setupForm: FormGroup;
  highScore: any;
  highScorer: string;

  constructor(formBuilder: FormBuilder, private router: Router) {
    this.setupForm = formBuilder.group({
      noOfQuestions: [10, Validators.compose([Validators.required])],
      category: ['any', Validators.compose([Validators.required])],
      difficulty: ['any', Validators.compose([Validators.required])],
    });

    this.highScore = localStorage.getItem('high_score');
    this.highScorer = localStorage.getItem('high_scorer');
  }

  ngOnInit() {
  }

  submit() {
    localStorage.setItem('noOfQuestions', this.setupForm.controls.noOfQuestions.value);
    localStorage.setItem('category', this.setupForm.controls.category.value);
    localStorage.setItem('difficulty', this.setupForm.controls.difficulty.value);
    this.router.navigate(['/play']);
  }
}
