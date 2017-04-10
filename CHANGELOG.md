<a name="1.0.0-beta.5.0"></a>
# [1.0.0-beta.5.0](https://github.com/ancor-dev/ng-rest/compare/1.0.0-beta.4.4...1.0.0-beta.5.0) (2017-04-10)

### Features
* Repository tags fixed and this CHANGLOG file initialized.

### BREAKING CHANGES
* `RestHookService` removed. `RestRequestService` created instead of it, `requestFormatterClass` moved too.

  This is done in order to avoid injecting of `RestHookService` in the all classes that extend `BaseRestService`
