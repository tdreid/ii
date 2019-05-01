const rng = require('lodash/random');

function AppViewModel(defaultInterests) {
  const self = this;

  self.interests = ko.observableArray(defaultInterests);
  self.entry = ko.observable('');

  self.integrate = () => {
    let arr = self.interests().slice();
    const rn = rng(arr.length - 1);
    const firstThing = arr[rn];
    arr.splice(rn, 1);
    const secondThing =
      self.entry() === '' ? arr[rng(arr.length - 1)] : self.entry();
    chrome.tabs.create({
      url: `https://www.google.com/search?num=100&q=${firstThing}+${secondThing}`
    });
  };

  self.addInterest = () => {
    if (!self.entry() == '') {
      self.interests.push(self.entry());
      chrome.storage.sync.set({ interests: self.interests() }, () => {
        self.entry('');
      });
    }
  };

  self.onEnter = (d, e) => {
    if (!e.shiftKey && !e.altKey && !e.ctrlKey && e.which === 13) {
      self.integrate();
    } else if (!e.shiftKey && !e.altKey && e.ctrlKey && e.which === 65) {
      self.addInterest();
    }
  };

  self.removeInterest = interest => {
    self.interests.remove(interest);
    chrome.storage.sync.set({ interests: self.interests() });
  };
}

function loadInterests() {
  const options = {
    attribute: 'data-bind',
    globals: window,
    bindings: ko.bindingHandlers,
    noVirtualElements: false
  };
  chrome.storage.sync.get({ interests: [] }, data => {
    ko.bindingProvider.instance = new ko.secureBindingsProvider(options);
    ko.applyBindings(new AppViewModel(data.interests));
  });
}

document.addEventListener('DOMContentLoaded', loadInterests);
