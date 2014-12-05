angular.module('directives.document', [
	'ui.bootstrap',
	'directives.icon',
	'resources.document',
    'directives.icon',
    'services.crud',
    'directives.actionicon',
    ])
.config([
    '$routeProvider',
    'crudRouteProvider',
    function (
        $routeProvider
        ){
        $routeProvider.when('/projects/:projectId/document/:documentId/edit/', {
            templateUrl:'directives/document-edit.tpl.html',
            controller:'DocumentEditCtrl',
            resolve:{
                document: [
                'Documents',
                '$route',
                function(Documents, $route) {
                    console.log("in routeprovider edit");
                    return Documents.getById($route.current.params.documentId);
                    console.log("end of routeprovider edit");
                }
                ],
                
            }
        });
    }
    ])
.directive('document', [
	function() {
		return {
			restrict: 'E',
			templateUrl: 'directives/document.tpl.html',
			replace: true,
			require: '^form',
			scope: {
				label: '@',
				resource: '=',
				date: '=',
				forResource : '@',
				resourceId : '@',
				scrumupdates: '=?'
			},

            controller: [
            '$scope',
            '$element',
            '$attrs',
            'Documents',
            '$location',
            function ($scope, $element, $attrs, Documents, $location) {
                $scope.fetchingDocuments = true;
                $scope.namefield = 'true';
                $scope.urlfield = 'true';
                $scope.textarea = 'true';
                var resourceId = $scope.resourceId;
                var forResource = $scope.forResource;
                $scope.showButton = true;
                var documentTypeValue="";
                $scope.OnItemClick= function(SelectedOption){
                    console.log("click working");
                    console.log(SelectedOption);
                    $scope.documentTypeValue = SelectedOption;
                    switch(SelectedOption)
                    {
                        case 'Text' : {
                            $scope.textarea = 'false';
                            $scope.namefield = 'true';
                            $scope.urlfield = 'true';
                            break;
                        }
                        case 'Wiki Node' : 
                        case 'Hydra Task' : {
                            $scope.namefield = 'false';
                            $scope.urlfield = 'false';
                            $scope.textarea = 'true';
                            break;
                        }
                    }

                };
                $scope.saveDocument = function(document){
                    var tagObj={};
                    var tagKey = Documents.getResourceKey(forResource);
                    tagObj[tagKey] = resourceId;
                    documentToSave ={};
                    documentToSave.documentTypeGroupId = '123';
                    if(document.text)
                    {
                       documentToSave.text = document.text ;
                   }
                   if(document.url)
                   {
                       documentToSave.url = (document.documentType == 'Hydra Task') ? "<a href='https://intranet.athenahealth.com/hydra/hydraframeset.esp?ID="+document.url+"'>"+document.url+"</a>" : "<a href = 'https://intranet.athenahealth.com/wiki/node.esp?ID="+document.url+"'>"+document.url+"</a>";
                   }
                   documentToSave.documentType = $scope.documentTypeValue;
                   documentToSave.name = document.name;
                   angular.extend(documentToSave,tagObj);
                   var documentObj = new Documents(documentToSave);
                   var successcb = function(){
                       console.log("saved successfully!!!");
                   };

                   var failurecb = function(){
                       console.log("could not save");
                   };
                   documentObj.$save(successcb, failurecb);
                   console.log("doc obj");
                   console.log(documentToSave);
               };

               $scope.editDocument = function(doc)
               {
                console.log("doc");
                console.log(doc);
                console.log($location);
                    // console.log($location.path().substring(0,$location.path().length-5)+'/document/'+doc._id.$oid+'/edit');
                    // $location.path($location.path().substring(0,$location.path().length-5)+'/document/'+doc._id.$oid+'/edit');
                    console.log($location.path().substring(0,$location.path().length-5)+'/document/'+doc.ID+'/edit');
                    $location.path($location.path().substring(0,$location.path().length-5)+'/document/'+doc.ID+'/edit');
                }

                $scope.clearDocument = function(resource){
                    console.log("testing");
                    console.log(resource);
                    $scope.document.text = "";
                    $scope.document.id ="";
                    $scope.document.name ="";
                };

                Documents.forResource(
                 forResource,
                 resourceId,
                 function (document) {
                    $scope.document = document;
                    $scope.fetchingDocuments = false;
                    console.log("document fetched");
                    console.log($scope.document);

                },
                function (response) {

                }
                );

            }
            ]


        };
    }
    ])

.controller('DocumentEditCtrl', [
    '$scope',
    '$location',
    'i18nNotifications',
    'document',
    'Documents',
    'crudListMethods',
    'crudEditHandlers',
    
    function ($scope, $location, i18nNotifications, document, Documents, crudListMethods,crudEditHandlers ) {

        $scope.document = document;
        console.log("document");
        console.log(document);
        if(document.text)
        {
            $scope.textarea = 'false';
            $scope.namefield = 'true';
            $scope.urlfield = 'true';
        }
        if(document.linkId)
        {
            $scope.namefield = 'false';
            $scope.urlfield = 'false';
            $scope.textarea = 'true';

        }
        var resourceId = $scope.resourceId;
        var forResource = $scope.forResource;
        $scope.showButton = true;
        $scope.ddSelectOptions = [
        {
            text: 'Text',
        },
        {
            text: 'Wiki Node',
        },
        {
            text: 'Hydra Task',
        },

        ];

        $scope.OnItemClick= function(SelectedOption){
            console.log("click working");
            console.log(SelectedOption);
            $scope.documentTypeValue = SelectedOption;
            switch(SelectedOption)
            {
                case 'Text' : {
                    $scope.textarea = 'false';
                    $scope.namefield = 'true';
                    $scope.urlfield = 'true';
                    document.linkId = '';
                    document.name = '';
                    break;
                }
                case 'Wiki Node' : 
                case 'Hydra Task' : {
                    $scope.namefield = 'false';
                    $scope.urlfield = 'false';
                    $scope.textarea = 'true';
                    document.text = '';
                    break;
                }
            }

        };

        $scope.onUpdate = function (document) {
            console.log("edit save fun ");
            console.log(document);
            document.documentType = document.documentType;
            document.documentTypeGroupId = '123';
            var documentObj = new Documents(document);
            console.log("obj");
            console.log(documentObj);
            console.log("inside save edit");
            var successcb = function(){
                console.log("saved successfully!!!");
            };
            var failurecb = function(){
                console.log("could not save");
            };
            documentObj.$saveOrUpdate(successcb, failurecb);
            i18nNotifications.pushForNextRoute('crud.document.save.success', 'success',{id : document.$id()});
            $location.path('/projects');
            
        };

        $scope.onError = function() {
            i18nNotifications.pushForCurrentRoute('crud.document.save.error', 'error');
        };

        $scope.onRemove = function(document) {
            i18nNotifications.pushForNextRoute('crud.document.remove.success', 'success', {id : document.$id()});
            //$location.path('/taskclass');
        };

    }

    
    ]);