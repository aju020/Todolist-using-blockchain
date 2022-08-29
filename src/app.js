App = {
    loading:false,
    contracts:{},

    load: async () => {
      await App.loadWeb3();
      await App.loadAccount();
      await App.loadContract();
      await App.render();
      web3.eth.defaultAccount = App.account;
    },
  
    // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
      } else {
        window.alert("Please connect to Metamask.")
      }
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
          // Request account access if needed
          await ethereum.enable()
          // Acccounts now exposed
          web3.eth.sendTransaction({/* ... */})
        } catch (error) {
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
      }
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    },
  
    loadAccount: async () => {
      // Set the current blockchain account
      App.account = web3.eth.accounts[0]
    },

    loadContract: async () => {
        //creating js version of smart contract
        const todoList = await $.getJSON('TodoList.json')
        App.contracts.TodoList=TruffleContract(todoList)
        App.contracts.TodoList.setProvider(App.web3Provider)

        //getting values from blockchain
        App.todoList = await App.contracts.TodoList.deployed()
    },

    render: async () => {
    // Prevent double render
        if (App.loading) {
            return
        }
  
    // Update app loading state
        App.setLoading(true)

    //putting account up top with html
        $('#account').html(App.account)
    
    //render tasks
        await App.renderTasks()
    
    //updating loading state
        App.setLoading(false)
    },

    renderTasks: async () => {
        //loading total tasks from bc
        const taskCount=await App.todoList.taskCount()
        const $taskTemplate = $('.taskTemplate')

        //take out(render out) each task with a new task template
        for (var i = 1; i <= taskCount; i++){
            //fetch task from blockchain
            const task = await App.todoList.tasks(i)
            const taskId = task[0].toNumber()
            const taskContent = task[1]
            const taskCompleted = task[2] 
            
            //create html for task
            const $newTaskTemplate = $taskTemplate.clone()
            $newTaskTemplate.find('.content').html(taskContent)
            $newTaskTemplate.find('input')
                            .prop('name', taskId)
                            .prop('checked', taskCompleted)
                            .on('click', App.toggleCompleted)

            //putting tasks to correct list
            if (taskCompleted) {
                $('#completedTaskList').append($newTaskTemplate)
            }else{
                $('#taskList').append($newTaskTemplate)
            }
            //show task
            $newTaskTemplate.show()
        }   
    },

    createTask: async() => {
        App.setLoading(true)
        const content = $('#newTask').val()
        await App.todoList.createTask(content)
        window.location.reload() //to reload page after inputting task
    },

    toggleCompleted: async (e) => {
        App.setLoading(true)
        const taskId = e.target.name
        await App.todoList.toggleCompleted(taskId)
        window.location.reload()
    },

    setLoading: (boolean) => {

        //used when app is loading where it hides content
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if (boolean) {
          loader.show()
          content.hide()
        } else {
          loader.hide()
          content.show()
        }
      }
  
  }
  
  $(() => {
    $(window).load(() => {
      App.load()
    })
  })