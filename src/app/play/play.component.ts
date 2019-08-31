import { Component, OnInit } from '@angular/core';
import { QuestionService } from '../services/question.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

interface STATE {
  state: string;
}

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss']
})
export class PlayComponent implements OnInit {
  score = 0;
  currentQuestionIndex = 0;
  currentQuestion: any;
  state: STATE;
  questionState: STATE;

  states: STATE[] = [
    { state: 'LOADING' },
    { state: 'READY' }
  ];

  questionStates: STATE[] = [
    { state: 'UNANSWERED' },
    { state: 'RIGHT' },
    { state: 'WRONG' }
  ];

  questions: any[];

  form: FormGroup;

  constructor(private questionService: QuestionService, private formBuilder: FormBuilder) {
    this.setState(this.states[0]);

    this.form = formBuilder.group({
      answer: ['', Validators.compose([Validators.required])]
    });
  }

  ngOnInit() {
    this.loadQuestions();
  }

  setState(state: STATE) {
    this.state = state;
  }

  setQuestionState(state: STATE) {
    this.questionState = state;
  }

  loadQuestions() {
    this.questionService.loadQuestions().subscribe((response: any) => {
      const questions: any[] = response.results;
      questions.forEach(question => {
        question.answers = [...question.incorrect_answers, question.correct_answer];
      });
      this.questions = questions;
      this.currentQuestion = questions[0];
      this.currentQuestionIndex += 1;
      this.setState(this.states[1]);
      this.setQuestionState(this.questionStates[0]);
    });
  }

  submit() {
    const answer = this.form.controls.answer.value;
    if (answer === this.currentQuestion.correct_answer) {
      switch (this.currentQuestion.difficulty.toLowerCase()) {
        case 'easy':
          this.score += 2;
          break;
        case 'medium':
          this.score += 4;
          break;
        case 'hard':
          this.score += 6;
          break;

        default:
          this.score += 2;
          break;
      }
      this.setQuestionState(this.questionStates[1]);
    } else {
      this.setQuestionState(this.questionStates[2]);
    }

    setTimeout(() => {
      this.loadNextQuestion();
    }, 7000);
  }

  loadNextQuestion() {
    if (this.currentQuestionIndex < this.questions.length) {
      this.currentQuestion = this.questions[this.currentQuestionIndex];
      this.currentQuestionIndex += 1;
      this.setQuestionState(this.questionStates[0]);
    }
  }
}
