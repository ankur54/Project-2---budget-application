var budgetController = (function () {
    
    var Expenses = function(id, desc, val) {
        this.id = id;
        this.desc = desc;
        this.val = val;
    };

    Expenses.prototype.calcPerc = function(income) {
        this.percentage = Math.round((this.val / income) * 100);
    };

    Expenses.prototype.getPerc = function() {
        return this.percentage;
    }

    var Income = function (id, desc, val) {
        this.id = id;
        this.desc = desc;
        this.val = val;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var budgetSum = function(type) {
        var sum = 0;
        data.allItems[type].forEach(e => {
            sum += e.val;
        });
        data.totals[type] = sum;
    };

    return {
        addItems: function(type, desc, val) {
            var newItem, ID;

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1] + 1;
            } else {
                ID = 0;
            }

            if(type === 'exp') newItem = new Expenses(ID, desc, val);
            else newItem = new Income(ID, desc, val);

            data.allItems[type].push(newItem);
            return newItem;
        },


        calculateBudget: function() {

            //1. calculate total expenses and income
            budgetSum('exp');
            budgetSum('inc');

            //2. calculate budget
            data.budget = data.totals.inc - data.totals.exp;

            //3. calculate percentage
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },


        getBudget: function() {
            return {
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp,
                budget: data.budget,
                percentage: data.percentage
            }
        },


        deleteItem: function(type, itemId) {
            var idList = data.allItems[type].map(function(curr) {
                return curr.id;
            });
            
            var reqId = idList.indexOf(itemId);
            data.allItems[type].splice(reqId, 1);
        },


        calculatePercentages: function() {

            data.allItems['exp'].forEach(curr => {
                curr.calcPerc(data.totals.inc);
            });

        },


        getPercentages: function() {

            var per = data.allItems['exp'].map(curr => {
                return curr.getPerc();
            });

            return per;

        },

        testing: function() {
            return data;
        }
    };

})();




var UIController = (function () {

    var DOMString = {
        type: ".add__type",
        desc: '.add__description',
        val: '.add__value',
        btn: '.add__btn',
        expense: '.expenses__list',
        income: '.income__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePerc: '.item__percentage',
        dateLabel: '.budget__title--month',
    };

    
    var nodeListForEach = function(item, callback) {
        for(var i = 0; i < item.length; i++){
            callback(item[i], i);
        }
    }

    var formatNumber = function(num, type) {

        var sign, num, dec;

        num = Math.abs(num);
        num = num.toFixed(2);
        num = num.split('.');

        int = num[0], dec = num[1];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        return (type === 'exp' ? sign = '-' : sign = '+') + " " + int + ' ' + dec;

    };


    return {
        getInput: function() {
            return {
                type: document.querySelector('.add__type').value,
                description: document.querySelector('.add__description').value,
                price: parseFloat(document.querySelector('.add__value').value),
            }
        },


        addListItem: function(obj, type) {
            var html, element, newHtml;
            
            if(type === 'inc') {
                element = DOMString.income;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else {
                element = DOMString.expense;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.desc);
            newHtml = newHtml.replace('%value%', obj.val);

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },


        clearFeilds: function() {
            feildArray = document.querySelectorAll(DOMString.desc + ", " + DOMString.val);
            var feild = Array.prototype.slice.call(feildArray);

            feild.forEach(curr => {
                curr.value = "";
            });

            feild[0].focus();
        },


        deleteUIitem: function(selectorID) {
            var element;
            element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },


        getDOM: function () {
            return DOMString;
        },


        displayBudget: function(obj) {
            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMString.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMString.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMString.expenseLabel).textContent = formatNumber(obj.totalExpense, 'exp');
            document.querySelector(DOMString.percentageLabel).textContent = (obj.percentage > 0 ? obj.percentage + "%" : "---");
        },


        displayPercentage: function(percentage) {

            var perc = document.querySelectorAll(DOMString.expensePerc);
            nodeListForEach(perc, function(current, i) {
                if(percentage[i] > 0) {
                    current.textContent = percentage[i] + "%";
                } else {
                    current.textContent = "---";
                }
            });

        },


        displayDate: function() {
            var now, year, month;
            
            now = new Date();
            year = now.getFullYear();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            document.querySelector(DOMString.dateLabel).textContent = months[month] + " " + year;

        },


        changeType: function() {

            var inputFields = document.querySelectorAll(DOMString.type + ", " + 
                DOMString.desc + ", " + DOMString.val);
            
            nodeListForEach(inputFields, function(curr, i) {
                curr.classList.toggle('red-focus');
            });

            document.querySelector(DOMString.btn).classList.toggle('red');

        }
    }

})();




var controller = (function (budgetCtrl, UICtrl) {
    var setUpEventListener = function () {
        document.querySelector(DOM.btn).addEventListener('click', ctrlAddListItem);

        document.addEventListener('keypress', function (e) {
            if (e.keyCode == 13 || e.which == 13) {
                ctrlAddListItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteListItem);

        document.querySelector(DOM.type).addEventListener('change', UICtrl.changeType);
    }

    var DOM = UICtrl.getDOM();


    var upadateBudget = function() {

        //1. Calculate budget
        budgetCtrl.calculateBudget();

        //2. Update budget on budgetController
        var newBudget = budgetCtrl.getBudget();

        //3. Display budget on UI
        UICtrl.displayBudget(newBudget);

    }


    var updatePercentage = function() {

        // 1. update percentage
        budgetCtrl.calculatePercentages();

        // 2. get percentages
        var percentages = budgetCtrl.getPercentages();

        // 3. display percentages
        UICtrl.displayPercentage(percentages);

    }


    var ctrlAddListItem = function() {
        
        //   1. get feild input data
        var input = UICtrl.getInput();
        if(input.description !== "" && !isNaN(input.price) && input.price > 0) {
            
            //   2. add items to the budget controller
            var newItem = budgetCtrl.addItems(input.type, input.description, input.price);

            //   3. add items to UI controller
            UICtrl.addListItem(newItem, input.type);
            
            //   4. clear fields
            UICtrl.clearFeilds();

            //   5. update budget
            upadateBudget();

            //   6. update percentage
            updatePercentage();

        }
       
        console.log("It works");
    }


    var ctrlDeleteListItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = splitID[1];

            //1. delete element from data structure
            budgetCtrl.deleteItem(type, ID);

            //2. delete element from UI
            UICtrl.deleteUIitem(itemID);

            //3. update budget
            upadateBudget();

            //4. update percentages
            updatePercentage();
            
        }
    }


    return {
        init: function () {
            console.log("Application Started");
            UICtrl.displayBudget({
                totalIncome: 0,
                totalExpense: 0,
                budget: 0,
                percentage: -1
            })
            setUpEventListener();
            UICtrl.displayDate();
        }
    }

})(budgetController, UIController);


controller.init();