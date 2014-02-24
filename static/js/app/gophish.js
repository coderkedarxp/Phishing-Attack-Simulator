var app = angular.module('gophish', ['ngTable', 'ngResource', 'ui.bootstrap']);

app.factory('CampaignService', function($resource) {
    return $resource('/api/campaigns/:id?api_key=' + API_KEY, {
        id: "@id"
    }, {
        update: {
            method: 'PUT'
        }
    });
});

app.factory('GroupService', function($resource) {
    return $resource('/api/groups/:id?api_key=' + API_KEY, {
        id: "@id"
    }, {
        update: {
            method: 'PUT'
        }
    });
});

app.controller('CampaignCtrl', function($scope, CampaignService, ngTableParams, $http) {
    $scope.flashes = []
    $scope.mainTableParams = new ngTableParams({
        page: 1, // show first page
        count: 10, // count per page
        sorting: {
            name: 'asc' // initial sorting
        }
    }, {
        total: 0, // length of data
        getData: function($defer, params) {
            CampaignService.query(function(campaigns) {
                $scope.campaigns = campaigns
                params.total(campaigns.length)
                $defer.resolve(campaigns.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            })
        }
    });

    $scope.addGroup = function() {
        if ($scope.group.name != "") {
            $scope.campaign.groups.push({
                name: $scope.group.name
            });
            $scope.group.name = ""
            $scope.editGroupTableParams.reload()
        }
    };

    $scope.removeGroup = function(group) {
        $scope.campaign.groups.splice($scope.campaign.groups.indexOf(group), 1);
        $scope.editGroupTableParams.reload()
    };

    $scope.newCampaign = function() {
        $scope.campaign = {
            name: '',
            groups: []
        };
    };

    $scope.editGroupTableParams = new ngTableParams({
        page: 1, // show first page
        count: 10, // count per page
        sorting: {
            name: 'asc' // initial sorting
        }
    }, {
        total: 0, // length of data
        getData: function($defer, params) {
            params.total($scope.campaign.groups.length)
            $defer.resolve($scope.campaign.groups.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });

    $scope.getGroups = function(val) {
        return $http.get('/api/groups/?api_key=' + API_KEY, {
            params: {
                q: val
            }
        }).then(function(res) {
            var groups = [];
            angular.forEach(res.data, function(item) {
                groups.push(item);
            });
            return groups;
        });
    };

    $scope.saveCampaign = function(campaign) {
        $scope.flashes = []
        var newCampaign = new CampaignService(campaign);
        newCampaign.$save({}, function() {
            $scope.campaigns.push(newCampaign);
            $scope.mainTableParams.reload()
        }, function(response){
            $scope.errorFlash(response.data)
        });
        $scope.campaign = {
            groups: [],
        };
        $scope.editGroupTableParams.reload()
    }

    $scope.deleteCampaign = function(campaign) {
        var deleteCampaign = new CampaignService(campaign);
        deleteCampaign.$delete({
            id: deleteCampaign.id
        }, function() {
            $scope.mainTableParams.reload();
        });
    }

    $scope.errorFlash = function(message) {
        $scope.flashes.push({"type" : "danger", "message" : message, "icon" : "fa-exclamation-circle"})
    }
});

app.controller('GroupCtrl', function($scope, GroupService, ngTableParams) {
    $scope.mainTableParams = new ngTableParams({
        page: 1, // show first page
        count: 10, // count per page
        sorting: {
            name: 'asc' // initial sorting
        }
    }, {
        total: 0, // length of data
        getData: function($defer, params) {
            GroupService.query(function(groups) {
                $scope.groups = groups
                params.total(groups.length)
                $defer.resolve(groups.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            })
        }
    });

    $scope.editGroupTableParams = new ngTableParams({
        page: 1, // show first page
        count: 10, // count per page
        sorting: {
            name: 'asc' // initial sorting
        }
    }, {
        total: 0, // length of data
        getData: function($defer, params) {
            params.total($scope.group.targets.length)
            $defer.resolve($scope.group.targets.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
    });

    $scope.editGroup = function(group) {
        if (group === 'new') {
            $scope.newGroup = true;
            $scope.group = {
                name: '',
                targets: [],
            };

        } else {
            $scope.newGroup = false;
            $scope.group = group;
            $scope.editGroupTableParams.reload()
        }
    };

    $scope.addTarget = function() {
        if ($scope.newTarget.email != "") {
            $scope.group.targets.push({
                email: $scope.newTarget.email
            });
            $scope.newTarget.email = ""
            $scope.editGroupTableParams.reload()
        }
    };
    $scope.removeTarget = function(target) {
        $scope.group.targets.splice($scope.group.targets.indexOf(target), 1);
        $scope.editGroupTableParams.reload()
    };
    $scope.saveGroup = function(group) {
        var newGroup = new GroupService(group);
        if ($scope.newGroup) {
            newGroup.$save({}, function() {
                $scope.groups.push(newGroup);
                $scope.mainTableParams.reload()
            });
        } else {
            newGroup.$update({
                id: newGroup.id
            })
        }
        $scope.group = {
            name: '',
            targets: [],
        };
        $scope.editGroupTableParams.reload()
    }
    $scope.deleteGroup = function(group) {
        var deleteGroup = new GroupService(group);
        deleteGroup.$delete({
            id: deleteGroup.id
        }, function() {
            $scope.mainTableParams.reload();
        });
    }
})