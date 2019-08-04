import { Injectable, OnDestroy } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ComponentModalComponent } from './component-modal.component';
import { CommonProperties } from '../../classes/exports';
import { GenericComponentModel } from '../..';

@Injectable({
  providedIn: 'root',
})
export class ComponentModalService extends CommonProperties implements OnDestroy{

  private modalRef: NgbModalRef = null;
  constructor(private ngbmodal: NgbModal) {
    super();
  }

  public Open(
    title: string,
    content: any,
    contentModel: GenericComponentModel = null,
    options: NgbModalOptions = null) {

    this.modalRef = this.ngbmodal.open(ComponentModalComponent, options);
    const innerComponent = (this.modalRef.componentInstance as ComponentModalComponent);
    innerComponent.component = content;
    innerComponent.title = title;
    this.rxs(innerComponent.Closed.subscribe(
      data => { this.Close(data); }
    ));

    if (contentModel !== null) {
      innerComponent.componentData = contentModel;
    }
  }

  public Close(any: any) {
    this.modalRef.close();
    this.modalRef = null;
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }
}
