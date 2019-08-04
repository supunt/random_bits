import { Component, OnInit, Output, EventEmitter, ViewContainerRef, ViewChild, Compiler, ComponentFactoryResolver, Renderer2, ElementRef } from '@angular/core';
import { GenericComponentModel } from '../..';

@Component({
  selector: 'ror-component-modal',
  templateUrl: './component-modal.component.html',
  styleUrls: ['./component-modal.component.scss']
})
export class ComponentModalComponent implements OnInit {

  constructor(private el: ElementRef,
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private render: Renderer2) { }

  @Output() Closed: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('container', {read: ElementRef}) viewContainerElRef: ElementRef;

  public title = '';
  public component: any;
  public componentData: GenericComponentModel = null;
  ngOnInit() {

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      this.component
    );
    const componentRef = this.viewContainerRef.createComponent(componentFactory);
    this.render.appendChild(this.viewContainerElRef.nativeElement, componentRef.location.nativeElement);
  }
}
