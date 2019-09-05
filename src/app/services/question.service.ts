import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CONFIG } from '../play/play.component';

const URL = environment.url;

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor(private http: HttpClient) { }

  loadQuestions(config: CONFIG) {
    // tslint:disable-next-line
    return this.http.get(`${URL}?amount=${config.noOfQuestions}${config.category !== 'any' ? `&category=${Number(config.category)}` : ''}${config.difficulty !== 'any' ? `&difficulty=${config.difficulty}` : ''}`);
  }
}
