public with sharing class CompanyDetails {

    @AuraEnabled(cacheable=true)
    public static List<String> getCompanyNames() {
        List<String> companyNames = new List<String>();
        for(Company__c company : [SELECT Name FROM Company__c]) {
            companyNames.add(company.Name);
        }
        return companyNames;
    }

    @AuraEnabled
    public static void createEmployee(String newName, String newRating, String newCompanyName) {
        try {
            Employee__c emp = new Employee__c();
            emp.Name = newName;
            emp.Ratings__c = newRating;
            emp.Company__r.Name = newCompanyName;
            insert emp;
             // Calculate average ratings for the company
            calculateAverageRatings(newCompanyName);

        } catch (Exception e) {
            throw new AuraHandledException('Error creating employee: ' + e.getMessage());
        }
    }

     // Method to calculate average ratings for a company
     public static void calculateAverageRatings(String companyName) {
        List<Employee__c> rating = [SELECT Ratings__c FROM Employee__c WHERE Company__c = :companyName];

        Integer total = 0;
        for(Employee__c ratings : rating){
            total += Integer.valueOf(ratings.Ratings__c);
        }

        Decimal avg = total/rating.size();

        Company__c cmp = [SELECT Id FROM Company__c WHERE Name = :companyName];
        cmp.Total_Ratings__c = avg;
        update cmp;
    }

}