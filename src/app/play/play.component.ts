import { Component, OnInit } from '@angular/core';
import { QuestionService } from '../services/question.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidateInput } from '../validators/input';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

declare global {
  interface Array<T> {
    shuffle(): Array<T>;
  }
}

Array.prototype.shuffle = function()  {
  // tslint:disable-next-line
  let currentIndex = this.length, tempVal, randIndex;

  while (currentIndex !== 0) {
    randIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    tempVal = this[currentIndex];
    this[currentIndex] = this[randIndex];
    this[randIndex] = tempVal;
  }
  return this;
};

interface STATE {
  state: string;
}

interface ISTATE {
  state: STATE;
  setState: (state: STATE) => void;
}

export interface CONFIG {
  noOfQuestions: number;
  category: string;
  difficulty: string;
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
    { state: 'READY' },
    { state: 'COMPLETED'},
    { state: 'ERROR'}
  ];

  questionStates: STATE[] = [
    { state: 'UNANSWERED' },
    { state: 'RIGHT' },
    { state: 'WRONG' }
  ];

  questions: any[];

  form: FormGroup;

  error: string;

  timeoutFn: any;
  intervalFn: any;
  timeout: number;
  config: CONFIG;

  constructor(private questionService: QuestionService, formBuilder: FormBuilder) {
    this.setState(this.states[0]);

    this.form = formBuilder.group({
      answer: ['select', Validators.compose([Validators.required, ValidateInput])]
    });

    this.config = {
      noOfQuestions: Number(localStorage.getItem('noOfQuestions')),
      category: localStorage.getItem('category'),
      difficulty: localStorage.getItem('difficulty')
    };
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
    this.questionService.loadQuestions(this.config).pipe(
      retry(3),
      catchError(this.handleError.bind(this))
    ).subscribe((response: any) => {
      const questions: any[] = response.results;
      questions.forEach(question => {
        question.answers = this.sanitizeText([...question.incorrect_answers, question.correct_answer]);
        question.question = this.sanitizeText(question.question);
        question.correct_answer = this.sanitizeText(question.correct_answer);
      });
      this.questions = questions;
      this.currentQuestion = questions[0];
      this.currentQuestionIndex += 1;
      this.setState(this.states[1]);
      this.setQuestionState(this.questionStates[0]);
      this.setQuestionTimeout(questions[0]);
    });
  }

  submit() {
    this.clearTimeout();
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
    }, 3000);
  }

  loadNextQuestion() {
    this.form.reset({ answer: 'select' });
    if (this.currentQuestionIndex < this.questions.length) {
      this.currentQuestion = this.questions[this.currentQuestionIndex];
      this.currentQuestionIndex += 1;
      this.setQuestionState(this.questionStates[0]);
      this.setQuestionTimeout(this.currentQuestion);
    } else {
      this.setState(this.states[2]);

      setTimeout(() => {
        const highScore = localStorage.getItem('high_score');

        if (highScore && highScore !== '') {
          const formattedHighScore = Number(highScore);
          if (this.score > formattedHighScore) {
            const name = prompt('High Score! Enter your name to save your score');
            if (name && name !== null) {
              localStorage.setItem('high_score', `${this.score}`);
              localStorage.setItem('high_scorer',  name);
            }
          }
        } else {
          if (this.score !== 0) {
            const name = prompt('High Score! Enter your name to save your score');
            if (name && name !== null) {
              localStorage.setItem('high_score', `${this.score}`);
              localStorage.setItem('high_scorer',  name);
            }
          }
        }
      }, 1000);
    }
  }

  restart() {
    this.setState(this.states[0]);
    this.setQuestionState(this.questionStates[0]);
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.loadQuestions();
  }

  sanitizeText(text: string|string[]) {
    if (typeof(text) === 'string') {
      const tempElm = document.createElement('span') as HTMLSpanElement;
      tempElm.innerHTML = text;
      return tempElm.innerText;
    }
    if (typeof(text) === 'object') {
      text.map((TEXT, index) => {
        const tempElm = document.createElement('span') as HTMLSpanElement;
        tempElm.innerHTML = TEXT;
        text.splice(index, 1, tempElm.innerText);
      });
      return text.shuffle();
    }
  }

  getReferralLink() {
    const linkArr = window.location.href.split('/');
    linkArr.splice(3, 1);
    // tslint:disable-next-line
    return encodeURI(`I just played Trivia! by Overrideveloper and I scored ${this.score}. Think you can do better? Play here: ${linkArr.join('/')}`);
  }

  setQuestionTimeout(question: any) {
    switch (question.difficulty.toLowerCase()) {
      case 'easy':
        this.timeout = 15;
        break;
      case 'medium':
        this.timeout = 30;
        break;
      case 'hard':
        this.timeout = 50;
        break;

      default:
        this.timeout = 15;
        break;
    }

    this.timeoutFn = setTimeout(() => {
      this.clearTimeout();
      setTimeout(() => {
        this.loadNextQuestion();
      }, 1000);
    }, this.timeout * 1000);

    this.intervalFn = setInterval(() => {
      this.timeout -= 1;
    }, 1000);
  }

  clearTimeout() {
    this.timeout = 0;
    clearTimeout(this.timeoutFn);
    clearInterval(this.intervalFn);
  }

  retry() {
    this.setState(this.states[0]);
    this.loadQuestions();
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      this.error = 'A network error occurred. Please confirm that you are connected to the internet.';
    } else if (error.error instanceof ProgressEvent) {
      this.error = 'An error occured. Please try again.';
    } else {
      this.error = 'We are having problems fetching the trivia questions. Please try again.';
    }
    this.setState(this.states[3]);
    return throwError('An error occured. Try again');
  }
}
