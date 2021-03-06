import { Component, OnInit, ViewChild, Inject } from '@angular/core';

import '../../../../common/ckeditor.loader';
import 'ckeditor';
import * as urls from "../../../../common/urls";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { Router } from '@angular/router';
import { ForumService } from '../../../../services/forum.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-guide-write',
  templateUrl: './guide-write.component.html',
  styleUrls: ['./guide-write.component.css']
})
export class GuideWriteComponent implements OnInit {
  ckeditorContent: string = '<p>Some html</p>';
  ckeditorConfig: any;

  // form
  title: String = '';
  registerForm: FormGroup;
  submitted = false;

  // multi-dropdown
  dataList:any = [];
  dropdownList:any = [];
  selectedItems = [];
  dropdownSettings = {};

  showPermit:number=1;

  selectedTemplate: string = '';

  isSubTitle: boolean = false;
  current_user:any={};
  current_user_role:any={};

  constructor(
              private formBuilder: FormBuilder, 
              private forumService:ForumService,
              private userService:UserService,
              private router: Router
  ) {
    
    this.registerForm = this.formBuilder.group({
      title: ['', Validators.required],
      subTitle: [''],
      category: ['guide'],
      content: ['', Validators.required],
      file: [''],
      selectedItems: [[]]
    });
    
    this.dropdownSettings = { 
      singleSelection: false,
      text:"관람자 선택",
      selectAllText:'전부 선택',
      unSelectAllText:'전부 해제',
      searchPlaceholderText: 'Search Fields',
      enableSearchFilter: true,
      badgeShowLimit: 5,
      groupBy: "category"
    };
    this.userService.getUserSession().subscribe(data =>{
      this.current_user=data['user'];
      this.current_user_role=data['role'];
    }
    ,
    (err)=>{
        console.log(err,err.message);
      }
    );
  }

  ngOnInit() {
    this.forumService.getGuideSpectator().subscribe(data =>{
      this.dropdownList = data;
      
    }
    ,
    (err)=>{
        console.log(err,err.message);
      }
    );
  }

  ngAfterViewChecked() {
    CKEDITOR.config.allowedContent=true
    CKEDITOR.config.fillEmptyBlocks=false;
    CKEDITOR.config.autoParagraph=false;
  }

  //event handler for the select element's change event
  selectChangeTemplateHandler (event: any) {
    //update the ui
    this.selectedTemplate = event.target.value;

    switch(this.selectedTemplate) {
      
      case "guide" : {
        this.showPermit = 1;
        break;
      }
      case "document" : {
        this.showPermit = 0;
        break;
      }
    }

  }

  // 첨부파일
  get f() { return this.registerForm.controls; }

  onFileChange(files: FileList) {
    const reader = new FileReader();
 
    if (files && files.length > 0) {
      
      // For Preview
      const file = files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.registerForm.patchValue({
          file: reader.result
       });
        // need to run CD since file load runs outside of zone
        //this.cd.markForCheck();
      };
    }
  }

  // back
  onBack() {
    this.router.navigate(['/forum/guide']);
  }

  // form summit
  onSubmit(files: FileList) {
    this.submitted = true;
    const formValue = this.registerForm.value;

    if(formValue.category == 'document') {
      if(!this.registerForm.get('subTitle').value){
        this.isSubTitle = true;
        return;
      }
    }

    // stop here if form is invalid
    if (this.registerForm.invalid) {
        return;
    }

    //alert('SUCCESS!! :-)\n\n' + JSON.stringify(this.registerForm.value))
    const formData = new FormData();

    if(files[0]){
      formData.append('file', files[0]);
    }
    formData.append('title', formValue.title);
    formData.append('subTitle', formValue.subTitle);
    formData.append('content', formValue.content);
    formData.append('category', formValue.category);
    
    var permitMember:string='';
    
    for(let item in formValue.selectedItems){
      if(item == "0"){
        permitMember = formValue.selectedItems[item].id;
        continue;
      }
      permitMember = permitMember+','+formValue.selectedItems[item].id;
    } 

    formData.append('permit',permitMember);
    this.forumService.postGuide(formData)
      .subscribe(res => {
        if(formValue.category == 'document') {
          this.router.navigate(['/forum/document']);
        }
        else {
          this.router.navigate(['/forum/guide']);
        }
    });
    
  }

  // multi drop list
  onItemSelect(item: any) {
  }
  OnItemDeSelect(item: any) {
  }
  onSelectAll(items: any) {
  }
  onDeSelectAll(items: any) {
  }
}
