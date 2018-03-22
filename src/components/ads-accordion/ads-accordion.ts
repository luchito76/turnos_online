import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'ads-accordion',
    template:
        `<div class="ads-accordion" [ngClass]="{'open': isOpen}">
            <div class="ads-accordion-header" (click)="onHeaderClick(item)">
                <h2>
                    <ng-content select="[header]"></ng-content>
                </h2>
                <ion-icon name="ios-arrow-dropdown"></ion-icon>
            </div>
            <div class="ads-accordion-content">
                <ng-content select="[content]"></ng-content>
            </div>
        </div>`
})
export class AdsAccordionPage implements OnInit {
    @Output() onToogle: EventEmitter<any> = new EventEmitter();
    public prevent: Boolean = false;

    isOpen: Boolean = false;

    ngOnInit() {

    }

    constructor() {

    }

    toogle(state: Boolean) {
        this.isOpen = state;
    }

    onHeaderClick() {
        if (this.prevent) {
            this.isOpen = !this.isOpen;
        }
        this.onToogle.emit(this.isOpen);
    }

}
