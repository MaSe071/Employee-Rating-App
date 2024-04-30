import { LightningElement, wire, track } from "lwc";
import { getListUi } from 'lightning/uiListApi';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import COMPANY_OBJECT from '@salesforce/schema/Company__c';
import NAME_FIELD from "@salesforce/schema/Company__c.Name";
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import EMPLOYEE_OBJECT from "@salesforce/schema/Employee__c";
import RATING_FIELD from "@salesforce/schema/Employee__c.Ratings__c";
import COMPANY_NAMES from '@salesforce/apex/CompanyDetails.getCompanyNames';
import createEmployee from '@salesforce/apex/CompanyDetails.createEmployee';


export default class Ratings extends LightningElement {

    accountRecordTypeId;
    records;
    cname;
    ratings;
    ratevalue;
    companyOptions = [];
    @track selectedCompany;
    @track companyNames = [];
    @track ratings = [];
    @track name
    @track value = '';

  @wire(getObjectInfo, { objectApiName: EMPLOYEE_OBJECT })
  results({ error, data }) {
    if (data) {
      this.accountRecordTypeId = data.defaultRecordTypeId;
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.accountRecordTypeId = undefined;
    }

    console.log("recordType", this.accountRecordTypeId);
  }

  @wire(getPicklistValues, { recordTypeId: "$accountRecordTypeId", fieldApiName: RATING_FIELD })
  picklistResults({ error, data }) {
    if (data) {
      this.ratings = data.values;
      this.error = undefined;
    } else if (error) {
      this.error = error;
      this.ratings = undefined;
    }
    console.log("ratings", this.ratings);
  }

    @wire(COMPANY_NAMES)
    wiredCompanyNames({ error, data }) {
        if (data) {
            this.companyOptions = data.map(company => ({
                label: company,
                value: company
            }));
            console.error('companies:', this.companyOptions);
        } else if (error) {
            console.error('Error fetching company names:', error);
        }
    }

    handleSave() {
        // Call the Apex method to save ratings
        saveRatings({ ratings: this.ratings })
            .then(result => {
                // Handle success
                console.log('Ratings saved successfully:', result);
            })
            .catch(error => {
                // Handle error
                console.error('Error saving ratings:', error);
            });
    }

  handleName(event){
    this.name = event.detail.value;
    console.log("name", this.name);
}

  handleChange(event) {
    // Get the string of the "value" attribute on the selected option
    this.ratevalue = event.detail.value;
    console.log("selected value", this.ratevalue);
}

    handleCompanyChange(event) {
        //validation Rule to check input rating values are be between 1 - 10
        if(event.detail.value < 1 || event.detail.value > 10){
            this.errorMessage = 'Rating must be between 1 and 10';
        }else{
            this.selectedCompany = event.detail.value;
            console.log("selected company", this.selectedCompany);
        }
        // Handle selection logic here
    }

    handleCreate() {
        createEmployee({ 
            newName: this.name, 
            newRating: this.value, 
            newCompanyName: this.selectedCompany 
        })
        .then(() => {
            // Handle success
            console.log('Employee created successfully');
            // Optionally, reset form fields after successful creation
            this.resetForm();
        })
        .catch(error => {
            // Handle error
            console.error('Error creating employee:', error);
        });
        console.log("apex data", this.name);
    }

    resetForm() {
        this.name = '';
        this.value = '';
        this.selectedCompany = '';
    }
}

