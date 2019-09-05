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
    return this.http.get(`${URL}?amount=${config.noOfQuestions}&category=${config.category}&difficulty=${config.difficulty}`);
  }
}
