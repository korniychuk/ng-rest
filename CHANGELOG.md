# [1.0.0-beta.5.7](https://github.com/ancor-dev/ng-rest/compare/1.0.0-beta.5.6...1.0.0-beta.5.7) (2017-04-18)
  
### Enhancements

* access modifiers of `BaseRestService.mapCollection` and `BaseRestService.mapCollection` changed to `public`
* Weakened typing of the first argument in `BaseRestService.send()` method. Now this is `RestRequestData<any>`

# [1.0.0-beta.5.6](https://github.com/ancor-dev/ng-rest/compare/1.0.0-beta.5.5...1.0.0-beta.5.6) (2017-04-17)
  
### Enhancements

* code style improvements

### Bug Fixes

* incorrect import `BaseRestService` in `BaseRequestFormatter` class.
  
# [1.0.0-beta.5.5](https://github.com/ancor-dev/ng-rest/compare/1.0.0-beta.5.4...1.0.0-beta.5.5) (2017-04-15)
  
### Enhancements

* added typing `(keyof M)[]` to `fields` and `expand` of the `RestRequestSearchParams` and `RestRequestData` interfaces, where `M` is the current model.  
  starting of the moment IDE will show hints for items of the `fields` and `expand` params.

### BREAKING CHANGES

* `RestRequestSearchParams` and `RestRequestData` now has `<M extends Model<M>>` argument, where `M` is current model.
  
# [1.0.0-beta.5.4](https://github.com/ancor-dev/ng-rest/compare/1.0.0-beta.5.3...1.0.0-beta.5.4) (2017-04-13)
  
### Enhancements

* Better comment in the `BaseRestService.fieldsMap` method :)

### BREAKING CHANGES

* Not you should use mapped field names `fields` and `expand`.  
  For example if in the `BaseRestService.fieldsMap()` specified that `user_surname` is `surname` than in the `fields` and `expand` you should use `surname`, not `user_surname`.
  
# [1.0.0-beta.5.3](https://github.com/ancor-dev/ng-rest/compare/1.0.0-beta.5.2...1.0.0-beta.5.3) (2017-04-12)

### Documentation

* Simple usage example in the README.md.

# [1.0.0-beta.5.2](https://github.com/ancor-dev/ng-rest/compare/1.0.0-beta.5.1...1.0.0-beta.5.2) (2017-04-11)

### Enhancements

* Getters removed from the `ResponseParser` and `.bind()` use in the `BaseRestService` getters

# [1.0.0-beta.5.1](https://github.com/ancor-dev/ng-rest/compare/1.0.0-beta.5.0...1.0.0-beta.5.1) (2017-04-10)

### Bug Fixes

* Remove export `RestSendHookService` service from the global package export and do export `RestRequestService`.

# [1.0.0-beta.5.0](https://github.com/ancor-dev/ng-rest/compare/1.0.0-beta.4.4...1.0.0-beta.5.0) (2017-04-10)

### Features
* Repository tags fixed and this CHANGLOG file initialized.

### BREAKING CHANGES
* `RestSendHookService` removed. `RestRequestService` created instead of it, `requestFormatterClass` moved too.

  This is done in order to avoid injecting of `RestSendHookService` in the all classes that extend `BaseRestService`
