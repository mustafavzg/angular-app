angular.module('workflows-edit',[
  'services.crud',
  'services.i18nNotifications',
  'underscore'
])

.controller('WorkflowsEditCtrl', [
	'$scope',
	'$location',
	'i18nNotifications',
	'Workflows',
	'workflow',
	'crudListMethods',
	'crudEditHandlers',
	'_',
	function ($scope, $location, i18nNotifications, Workflows, workflow, crudListMethods, crudEditHandlers, _) {
		$scope.workflow = workflow;
		$scope.userscrudhelpers = {};
		angular.extend($scope.userscrudhelpers, crudListMethods('/workflows'));
		angular.extend($scope, crudEditHandlers('workflow'));

		// create a state
		// returns an id of 1
		//		when the first time when it is called
		//		increments id by 1 and returns it during subsequent calls.
		var idGenerator = function(){
			id = 0;
			return function(){
				id += 1;
				return id;
			};
		}();

		// create a state
		// which contains:
		// 	a name.
		// 	an object which points to the next state.
		// 	an object which points to the next button.
		var State = function(){
			this.type = 'textbox';
			this.stateName = null;
			this.nextState = null;
			this.nextButton = null;
			this.stateID = idGenerator();
		};
		// Tracks the previous and next state
		var ButtonObj = function(){
			this.type = 'button';
			this.previousState = null;
			this.nextState = null;
		};

		var startState = new State();
		startState.stateName = "START";
		var endState = new State();
		endState.stateName = "END";
		startState.nextState = endState;
		var button = new ButtonObj();
		button.previousState = startState;
		button.nextState = endState;
		startState.nextButton = button;

		// TransitionMap
		// 		a hash object which map each state with the list of
		//	allowable states.
		var trasitionMap = {};
		// stateNameMap
		// creates a mapping between state name and the state object
		var stateNameObjMap = {};
		// Initialize the previous and next states to null
		$scope.currentState = null;
		$scope.startState = startState;
		$scope.showAdd = true;
		$scope.nextStates = {};
		$scope.displayProps = [startState, button, endState];
		// object decides whether or not to show the state transition button.
		// Initially show all.
		// uses stateID as key.
		$scope.showStateTransition = {};
		$scope.showStateTransition[startState.stateID] = true;
		$scope.showStateTransition[endState.stateID] = true;
		$scope.nextStates[startState.stateID] = "";
		$scope.nextStates[endState.stateID] = "";
		stateNameObjMap[startState.stateName] = startState;
		stateNameObjMap[endState.stateName] = endState;
		$scope.createNewState = function(button){
			// create button and state objects that should be saved.
			var newButton = new ButtonObj();
			var newState = new State();
			$scope.nextStates[newState.stateID] = "";
			$scope.showStateTransition[newState.stateID] = true;
			stateNameObjMap[newState.stateName] = newState;
			// Establish links for newState and newButtton.
			newButton.previousState = button.previousState;
			newButton.nextState = newState;
			newState.nextState = button.nextState;
			newState.nextButton = button;

			// Adjust links for the previous state.
			button.previousState.nextButton = newButton;
			button.previousState.nextState = newState;

			// Adjust links for the button.
			button.previousState = newState;
			$scope.showAdd = false;
			$scope.showAddAllowableButton = true;
			$scope.displayProps = [];
			var currentState = startState;
			while(currentState != endState){
				$scope.displayProps.push(currentState);
				// if the element type is textbox then fetch the next button using the nextButton pointer
				// else fetch the next textbox using the next state pointer from the button object.
				if(currentState.type == 'textbox'){
					currentState = currentState.nextButton;
				}else{
					currentState = currentState.nextState;
				}
			}
			$scope.displayProps.push(endState);
		};

		$scope.saveState = function(stateName){
			$scope.currentState.stateName = stateName;
			stateMap[stateName] = $scope.currentState;
			$scope.showAdd = true;
			$scope.showAddAllowableButton = true;
		};

		$scope.addAllowableStatesFromCurrent = function(allowableStateNum){
			trasitionMap[$scope.stateName] = [];
			for(var i=0;i<allowableStateNum;i++){
				trasitionMap[$scope.stateName].push(new State());
			}
			$scope.showAddAllowableButton = false;
		};
		$scope.defineStateTransitionsFrom = function(state){
			$scope.showStateTransition[state.stateID] = false;
		};

		$scope.saveStateTransitionsFrom = function(state){
			$scope.showStateTransition[state.stateID] = true;
			var currentToStates = $scope.nextStates[state.stateID];
			var toStatesNameArray = currentToStates.split(" ");
			var toStatesObjArray = [];
			_.each(toStatesNameArray, function(stateName) {
				toStatesObjArray.push(stateNameObjMap[stateName]);
			});
			trasitionMap[state.stateID] = toStatesObjArray;
		};
	}
]);