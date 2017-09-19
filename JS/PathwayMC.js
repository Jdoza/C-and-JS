//// CONTROLLER TO EDIT ////
(function () {
    "use strict";
    angular.module("Company")
        .controller("editController", editController);

    editController.$inject = ["ServicesFactory", "$state", "$stateParams", '$scope', "debounce", "$timeout", "alertService"];

    function editController(ServicesFactory, $state, $stateParams, $scope, debounce, $timeout, alertService) {
        var vm = this;
        vm.thisPathwayInfo = _thisPathwayInfo;
        vm.cancelEditPath = _cancelEditPath;
        vm.pathwayList = [];
        vm.editTheContent = false;
        vm.editMode = false;
        vm.loadStatus = false;
        vm.PathwayId = $stateParams.id;
        vm.submitPathwayChanges = _submitPathwayChanges;
        vm.submitContentChanges = _submitContentChanges;
        vm.editThisContent = _editThisContent;
        vm.removeContent = _removeContent;
        vm.addEditContent = _addEditContent;
        vm.deactivatePath = _deactivatePath;
        vm.moveUp = _moveUp;
        vm.moveDown = _moveDown;
        vm.list = {};
        vm.thisPathwayInfo();
        getPathwayContent();

        //// EDIT OR ADD CONTENT ////
        function _addEditContent() {
            if (vm.editMode == true) {
                vm.pathwayList[vm.contentIndex] = vm.edit;
                vm.edit = {};
                $scope.$broadcast("reloadTagInputs");
                vm.editMode = false;
            }
            else if (angular.isDefined(vm.pathwayList)) {
                vm.pathwayList.push(vm.edit);
                vm.edit = {};
                $scope.$broadcast("reloadTagInputs");
            }
        }
        //// REPOPULATES DESIRED CONTENT TO EDIT ////
        function _editThisContent(path, $index) {
            vm.contentIndex = $index;
            vm.edit = angular.copy(path);
            $scope.$broadcast("reloadTagInputs");
            vm.editMode = true;
        }
        //// GETS DESIRED PATHWAY ID ////
        function _thisPathwayInfo() {
            var id = $stateParams.id
            ServicesFactory.getThisPathway(id).then(_getPathInfoSuccess, _getPathInfoUnsuccessful);
        }
        function _getPathInfoSuccess(response) {
            vm.data = response.data.item;
            repopulateEditPathway(vm.data);
        }
        function _getPathInfoUnsuccessful(error) {
            return error;
        }
        //// FILLS FORM WITH DESIRED PATHWAY TO EDIT ////
        function repopulateEditPathway(data) {
            vm.data.name = data.name;
            vm.data.description = data.description;
            vm.data.topics = data.topics;
            $scope.$broadcast('reloadTagInputs');
        }
        //// GETS PATHAY CONTENT ////
        function getPathwayContent() {
            var id = $stateParams.id;
            ServicesFactory.getPathwayCont(id).then(_getPathwayContentSuccess);
        }

        function _getPathwayContentSuccess(response) {
            var info = response.data.items;
            for (var i = 0; i < info.length; i++) {
                vm.pathwayList.push(info[i]);
            }
        }
        //// CANCEL ////
        function _cancelEditPath() {
            delete localStorage.pathwayData;
            $state.go("pathwayCreator");
        }
        //// SUBMIT PATHWAY CHANGES ////
        function _submitPathwayChanges() {
            var data = {};
            data.Id = $stateParams.id
            data.Name = vm.data.name
            data.Description = vm.data.description;
            data.Topics = vm.data.topics;
            data.CoverImage = vm.data.coverImage;
            ServicesFactory.submitPathChanges(data);
            vm.editTheContent = true;
            alertService.success("Pathway changes was successful");
        }
        //// SUBMIT CONTENT CHANGES ////
        function _submitContentChanges() {
            var arr = [];
            var pathId = $stateParams.id;
            for (var i = 0; i < vm.pathwayList.length; i++) {
                vm.data = {};
                vm.data.PathwayId = pathId;
                vm.data.ContentName = vm.pathwayList[i].contentName;
                vm.data.level = i + 1;
                vm.data.ContentItemId = vm.pathwayList[i].contentItemId;
                vm.data.UserId = vm.pathwayList[i].userId;
                vm.data.ContentTopics = vm.pathwayList[i].contentTopics;
                arr.push(vm.data);  
            }
            vm.list.contentList = arr;
            ServicesFactory.submitContChanges(vm.PathwayId, vm.list);
            alertService.success("Successfully made content changes");
            localStorage.clear();
            $state.go("pathwayCreator");
        }
        //// REMOVE CONTENT ////
        function _removeContent($index) {
            var index = $index;
            vm.pathwayList.splice(index, 1);
        }
        //// MOVE ARRAY ITEM UP ////
        function _moveUp($index) {
            if ($index + 1 < vm.pathwayList.length) {
                var original = $index; // say 1
                var save = vm.pathwayList[original + 1] // save holds the info in w/index of 2
                vm.pathwayList[original + 1] = vm.pathwayList[original]; // index 2 equals to the info of index 1 
                vm.pathwayList[original] = save; // now we assign original index to the var save
            }
        }
        //// MOVE ARRAY ITEM DOWN ////
        function _moveDown($index) {
            if ($index != 0) {
                var original = $index; // say 1
                var save = vm.pathwayList[original - 1] // save holds the info in w/index of 2
                vm.pathwayList[original - 1] = vm.pathwayList[original]; // index 2 equals to the info of index 1 
                vm.pathwayList[original] = save; // now we assign original index to the var save
            }
        }
        //// DEACTIVATE PATH ////
        function _deactivatePath() {
            var pathId = $stateParams.id
            ServicesFactory.deactivate(pathId);
            $state.go("pathwayCreator");
            delete localStorage.pathwayData;
        }
    }
})();

//// FACTORY FOR AJAX CALLS ////
(function () {
    "use strict";
    angular.module("Company")
        .factory("ServicesFactory", servicesFactory);

    servicesFactory.$inject = ["$http", "$q"];

    function servicesFactory($http, $q) {
        return {
            createPW: _createPW,
            deactivate: _deactivate,
            getThisPathway: _getThisPathway,
            getPathwayCont: _getPathwayCont,
            createContent: _createContent,
            submitPathChanges: _submitPathChanges,
            submitContChanges: _submitContChanges,
            get: _get
        };

        function _getThisPathway(id) {
            var settings = {
                url: "/api" + id
                , method: "GET"
                , cache: false
                , withCredentials: true
            };
            return $http(settings).then(_thisPathwaySuccess, _thisPathwayFail);
        }

        function _thisPathwaySuccess(response) {
            return response;
        }

        function _thisPathwayFail(error) {
            return $q.reject("Getting the pathway was unsuccessful");
        }

        function _getPathwayCont(id) {
            var settings = {
                url: "/api" + id
                , method: "GET"
                , cache: false
                , withCredentials: true
            };
            return $http(settings).then(_pathwayContSuccess, _pathwayContFail);
        }

        function _pathwayContSuccess(response) {
            return response;
        }

        function _pathwayContFail(error) {
            return $q.reject("Getting the content was unsuccessful");
        }

        function _submitPathChanges(data) {
            var settings = {
                url: "/api" + data.Id
                , method: "PUT"
                , contentType: "application/JSON"
                , cache: false
                , data: JSON.stringify(data)
                , withCredentials: true
            };
            return $http(settings).then(_pathChangeSuccess, _pathChangeFail);
        }

        function _pathChangeSuccess(response) {
            return response;
        }

        function _pathChangeFail(error) {
            return $q.reject("Could not submit content changes");
        }

        function _submitContChanges(PathwayId, data) {
            var settings = {
                url: "/api" + PathwayId
                , method: "PUT"
                , contentType: "application/JSON"
                , cache: false
                , data: JSON.stringify(data)
                , withCredentials: true
            };
            return $http(settings).then(_contChangeSuccess, _contChangeFail);
        }

        function _contChangeSuccess(response) {
            return response;
        }

        function _contChangeFail(error) {
            return $q.reject("Could not submit content changes")
        }

        function _createPW(data) {
            var settings = {
                url: "/api"
                , method: "POST"
                , contentType: "application/JSON"
                , cache: false
                , data: JSON.stringify(data)
                , withCredentials: true
            };
            return $http(settings).then(_createSuccessful, _createUnsuccessful);
        }

        function _createSuccessful(response) {
            return response; // gets the  pathway id
        }

        function _createUnsuccessful(error) {
            return $q.reject("Creating the pathway was unsuccessful")
        }

        function _createContent(data) {
            var settings = {
                url: "/api" + data.PathwayId
                , method: "POST"
                , contentType: "application/JSON"
                , cache: false
                , data: JSON.stringify(data)
                , withCredentials: true
            };
            return $http(settings).then(_createContentSuccessful, _createContentError);
        }

        function _createContentSuccessful(response) {
            return response.data;
        }

        function _createContentError(error) {
            return $q.reject("Creating the content was unsuccessful")
        }

        function _deactivate(PathwayId) {
            var settings = {
                url: "/api" + PathwayId
                , method: "DELETE"
                , withCredentials: true
                , cache: false
            };
            return $http(settings)
                .then(_deactivateSuccess, _deactivateUnsuccessful);
        }

        function _deactivateSuccess(response) {
            return response;
        }

        function _deactivateUnsuccessful(error) {
            return $q.reject("Could not delete");
        }
    }
})();

//// service for debounce ////
(function () {
    "use strict";
    angular.module("Company")
        .factory("debounce", debouncer);

    debouncer.$inject = ["$timeout"];

    function debouncer($timeout) {
        return function (callback, interval) {
            var timeout = null;
            return function () {
                $timeout.cancel(timeout); // clears the timeout
                timeout = $timeout(callback, interval); // pass callback, interval to $timeout
            };
        }
    }
})();

//// directive for tagsinput////
(function () {
    "use strict";
    angular.module("Company")
        .directive("bwInitTagsInput", bwInitTagsInput);

    bwInitTagsInput.$inject = ['$timeout'];

    function bwInitTagsInput($timeout) {
        return {
            restrict: "A",

            link: function (scope, elem, attr) {
                elem.tagsinput();

                scope.$on(attr.bwInitTagsInput, function () {
                    $timeout(function () {
                        elem.tagsinput('destroy');  //destroys it and rebuilds it on the next line
                        elem.tagsinput();
                    });
                })
            }
        }
    }
})();