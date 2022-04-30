This code is able to 
* Generates GHAS Org level findings in an excel 
  * code scanning alerts.
  * dependabot alerts.
  * secret scanning alerts.
* Consider API Pagination limits.
* Is bottleneck by API rate limit of 5000 calls/hr/user. 
  * Rate limit and other errors are captured in the excel file.
* Make multiple parallel asynchronous calls. Is not multi-threaded. 
* Capture all error logs in an excel worksheet.

usage: 
* copy and paste [this](https://github.com/amitgupta7/node-async/blob/master/.github/workflows/run-test.yml) workflow in your repo
* Set appropreate PAT and ORG value in the `env` section of the workflow.
* run the workflow (and wait for about 30 - 40 mins) 

