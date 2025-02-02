import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Cardinality } from '../telemetry-constants';
import { UtilService } from '../util-service';
import * as _ from 'lodash-es';

@Component({
  selector: 'quml-mcq-option',
  templateUrl: './mcq-option.component.html',
  styleUrls: ['./mcq-option.component.scss']
})
export class McqOptionComponent implements OnChanges {

  @Input() shuffleOptions: boolean
  @Input() mcqOptions: any;
  @Input() solutions: any;
  @Input() layout: any;
  @Input() cardinality: string;
  @Input() numberOfCorrectOptions: number;
  @Output() showPopup = new EventEmitter();
  @Output() optionSelected = new EventEmitter<any>();
  selectedOption = [];
  @Input() replayed: boolean;
  @Input() tryAgain?: boolean;

  constructor(
    public utilService: UtilService
  ) { }

  ngOnChanges() {
    /* istanbul ignore else */
    
    this.mcqOptions =  this.shuffleOptions ? _.shuffle(this.mcqOptions)  :   this.mcqOptions;
    //this.mcqOptions= _.shuffle(this.mcqOptions);
    
    if (this.replayed) {
      this.selectedOption = [];
      this.mcqOptions.forEach((ele) => {
        ele.selected = false;
        ele['isDisabled'] = false;
      });
      this.selectedOption = [];
    }
    /* istanbul ignore else */
    if (this.tryAgain) {
      this.unselectOption();
    }
  }

  unselectOption() {
    this.mcqOptions.forEach((ele) => {
      ele.selected = false;
      ele['isDisabled'] = false;
    });
    this.selectedOption = [];
    this.optionSelected.emit(
      {
        name: 'optionSelect',
        option: this.selectedOption,
        cardinality: this.cardinality,
        solutions: this.solutions
      }
    );
  }

  onOptionSelect(event: MouseEvent | KeyboardEvent, mcqOption, index?: number) {
    if (this.cardinality === Cardinality.single) {
      if (index !== undefined) {
        this.mcqOptions.forEach((ele) => ele.selected = false);
        this.mcqOptions[index].selected = this.mcqOptions[index].label === mcqOption.label
      } else {
        this.mcqOptions.forEach(element => {
          element.selected = element.label === mcqOption.label;
        });
      }
    }
    else if (this.cardinality === Cardinality.multiple) {
      this.mcqOptions.forEach(element => {
        if (element.label === mcqOption.label) {
          if(this.utilService.hasDuplicates(this.selectedOption, mcqOption)) {
            element.selected = false;
            this.selectedOption = _.filter(this.selectedOption, (item) => item.label !== mcqOption.label);
          } else {
            element.selected = true;
            this.selectedOption.push(mcqOption);
          }
        }
      });

      if (this.selectedOption.length === this.numberOfCorrectOptions) {
        // disable extra options
        this.selectedOption.forEach(selectedEelement => {
          this.mcqOptions.forEach(element => {
            if ((element.label != selectedEelement.label) && !element.selected) {
              element['isDisabled'] = true;
            } else {
              element['isDisabled'] = false;
            }
          })
        });
      } else {
        this.mcqOptions.forEach(element => {
          element['isDisabled'] = false;
        });
      }
    }

    this.optionSelected.emit(
      {
        name: 'optionSelect',
        option: this.cardinality === 'single' ? mcqOption : this.selectedOption,
        cardinality: this.cardinality,
        solutions: this.solutions
      }
    );
  }

  showQumlPopup() {
    this.showPopup.emit();
  }

  onEnter(event: KeyboardEvent, mcqOption, index: number) {
    /* istanbul ignore else */
    if (event.key === 'Enter') {
      event.stopPropagation();
      this.onOptionSelect(event, mcqOption, index);
    }
  }
}
