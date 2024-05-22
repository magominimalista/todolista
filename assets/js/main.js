document.addEventListener('DOMContentLoaded', () => {
    const addTaskBtn = document.getElementById('add-task-btn');
    const newTaskInput = document.getElementById('new-task-input');
    const tasksList = document.getElementById('tasks');
    const searchTaskInput = document.getElementById('search-task');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');

    // Mostra o carregador ao carregar a página
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('loader').style.display = 'block';
    });
    
    // Oculta o carregador quando o conteúdo estiver pronto
    window.addEventListener('load', () => {
        document.getElementById('loader').style.display = 'none';
    });

    // Carrega as tarefas do localStorage
    const loadTasks = () => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
        // Separa as tarefas da função handleRemoveTask
        const savedHandleRemoveTask = tasks.pop()?.handleRemoveTask; 
    
        // Reverte a ordem das tarefas
        tasks.reverse();
    
        tasks.forEach(task => {
            addTaskToDOM(task.text, task.completed);
        });
    
        // Aplica a função handleRemoveTask a todos os botões de remoção
        const removeButtons = document.querySelectorAll('.remove-task-btn');
        if (savedHandleRemoveTask) {
            const restoredHandleRemoveTask = new Function(`return ${savedHandleRemoveTask}`)();
            removeButtons.forEach(removeButton => {
                handleRemoveTask(removeButton, restoredHandleRemoveTask); // Passa a função restaurada como parâmetro
            });
        }

        toggleEmptyMessage();
    };
    
    // Salva as tarefas no localStorage
    const saveTasks = () => {
        const tasks = [];
        tasksList.querySelectorAll('.task-item').forEach(taskItem => {
            const taskLabel = taskItem.querySelector('label').textContent;
            const taskCompleted = taskItem.querySelector('.task-checkbox').checked;
            tasks.push({ text: taskLabel, completed: taskCompleted });
        });

        // Adiciona a função handleRemoveTask ao objeto de tarefas
        tasks.push({ handleRemoveTask: handleRemoveTask.toString() }); 

        localStorage.setItem('tasks', JSON.stringify(tasks));

        toggleEmptyMessage();
    };

    const addTaskToDOM = (taskText, completed = false) => {
        const newTaskItem = document.createElement('li');
        newTaskItem.classList.add('task-item');

        const newTaskCheckbox = document.createElement('input');
        newTaskCheckbox.type = 'checkbox';
        newTaskCheckbox.classList.add('task-checkbox');
        const newTaskId = `task${tasksList.children.length + 1}`;
        newTaskCheckbox.id = newTaskId;
        newTaskCheckbox.checked = completed;

        const newTaskLabel = document.createElement('label');
        newTaskLabel.htmlFor = newTaskId;
        newTaskLabel.textContent = taskText;

        const editTaskBtn = document.createElement('button');
        editTaskBtn.classList.add('edit-task-btn');
        editTaskBtn.textContent = 'Editar';

        const removeTaskBtn = document.createElement('button');
        removeTaskBtn.classList.add('remove-task-btn');
        removeTaskBtn.textContent = 'Remover';

        newTaskItem.appendChild(newTaskCheckbox);
        newTaskItem.appendChild(newTaskLabel);
        newTaskItem.appendChild(editTaskBtn);
        newTaskItem.appendChild(removeTaskBtn);

        tasksList.insertBefore(newTaskItem, tasksList.firstChild);

        handleCheckboxChange(newTaskCheckbox);
        handleEditTask(editTaskBtn);
        handleRemoveTask(removeTaskBtn);

        // Chame a função toggleEmptyMessage para verificar se há tarefas após adicionar uma nova tarefa
        toggleEmptyMessage();
        console.log("Tarefa adicionada ao DOM");
    };

    const addTask = () => {
        const inputText = newTaskInput.value.trim();

        if (inputText !== "") {
            const tasks = inputText.split('; ');

            tasks.forEach(taskText => {
                if (taskText !== "") {
                    addTaskToDOM(taskText);
                }
            });

            newTaskInput.value = "";
            saveTasks();
        } else {
            alert("Por favor, insira uma tarefa.");
        }
        
        toggleEmptyMessage();
    };

    const handleRemoveTask = (removeButton, restoredHandleRemoveTask = handleRemoveTask) => { // Valor padrão se não for fornecido
        removeButton.addEventListener('click', () => {
            const taskItem = removeButton.parentElement;
            taskItem.classList.add('fadeOut');
            setTimeout(() => {
                tasksList.removeChild(taskItem);
                saveTasks(); // Salva as tarefas após a remoção
                toggleEmptyMessage();
            }, 500);
        });
    };

    addTaskBtn.addEventListener('click', addTask);

    newTaskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    const handleEditTask = (editButton) => {
        editButton.addEventListener('click', () => {
            const taskItem = editButton.parentElement;
            const taskLabel = taskItem.querySelector('label');
            const taskInput = document.createElement('input');
            taskInput.type = 'text';
            taskInput.classList.add('edit-task-input');
            taskInput.value = taskLabel.textContent;
            taskLabel.textContent = "";
            taskLabel.appendChild(taskInput);
            taskInput.focus();

            taskItem.classList.add('editing');

            taskInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    taskLabel.textContent = taskInput.value;
                    taskItem.classList.remove('editing');
                    saveTasks();
                }
            });

            taskInput.addEventListener('blur', () => {
                taskLabel.textContent = taskInput.value;
                taskItem.classList.remove('editing');
                saveTasks();
            });
        });
    };

    const handleCheckboxChange = (checkbox) => {
        checkbox.addEventListener('change', () => {
            const taskItem = checkbox.parentElement;
            if (checkbox.checked) {
                taskItem.classList.add('completed');
                taskItem.classList.remove('uncompleted');
            } else {
                taskItem.classList.add('uncompleted');
                taskItem.classList.remove('completed');
                setTimeout(() => {
                    taskItem.classList.remove('uncompleted');
                }, 300); // Duração da animação em milissegundos
            }
            saveTasks();
        });
    };

    searchTaskInput.addEventListener('input', () => {
        const searchText = searchTaskInput.value.toLowerCase();
        const allTasks = tasksList.querySelectorAll('.task-item');

        allTasks.forEach(task => {
            const taskLabel = task.querySelector('label');
            const taskText = taskLabel.textContent.toLowerCase();
            if (taskText.includes(searchText)) {
                task.style.display = 'flex';
            } else {
                task.style.display = 'none';
            }
        });
    });

    const exportTasks = () => {
        const tasks = [];
        tasksList.querySelectorAll('.task-item').forEach(taskItem => {
            const taskLabel = taskItem.querySelector('label').textContent;
            const taskCompleted = taskItem.querySelector('.task-checkbox').checked;
            const taskPrefix = taskCompleted ? '- [x] ' : '- [ ] ';
            tasks.push(taskPrefix + taskLabel);
        });

        const blob = new Blob([tasks.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tarefas.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const importTasks = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const lines = content.split('\n');
                // tasksList.innerHTML = ''; // Remove a linha que limpa a lista
    
                lines.forEach(line => {
                    const taskText = line.substring(line.indexOf(']') + 2);
                    const taskCompleted = line.startsWith('- [x] ');
                    if (taskText.trim() !== "") {
                        addTaskToDOM(taskText, taskCompleted);
                    }
                });
                saveTasks();
            };
            reader.readAsText(file, 'UTF-8');
        } else {
            alert('Por favor, importe um arquivo de texto (.txt).');
        }

        toggleEmptyMessage(); 
    };
    
    exportBtn.addEventListener('click', exportTasks);
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', importTasks);

    // Fechar o hint card
    const hintCard = document.getElementById('hint-card');
    const closeBtn = document.getElementById('close-btn');

    closeBtn.addEventListener('click', () => {
        hintCard.classList.add('closing');
        setTimeout(() => {
            hintCard.style.display = 'none';
        }, 500); // Tempo da animação de saída
    });
    
    // Seletor do elemento de mensagem vazia
    const emptyMessage = document.getElementById('empty-message');

    // Função para exibir ou ocultar a mensagem de acordo com o número de tarefas
    const toggleEmptyMessage = () => {
        const tasks = document.querySelectorAll('.task-item');
        if (tasks.length === 0) {
            emptyMessage.style.display = 'block';
        } else {
            emptyMessage.style.display = 'none';
        }
    };

    const clearBtn = document.getElementById('clear-btn');

    clearBtn.addEventListener('click', () => {
        const confirmar = confirm(
            "Tem certeza que deseja limpar a lista? Esta ação não pode ser desfeita."
        );

        if (confirmar) {
            tasksList.innerHTML = ''; // Limpa a lista
            saveTasks(); // Salva o estado vazio da lista
            toggleEmptyMessage(); // Mostra a mensagem de lista vazia
        }

        toggleEmptyMessage();
    });

    const themeBtn = document.getElementById("theme-btn");
    const themeLink = document.getElementById("theme-link");

    // Verifica o tema salvo no localStorage ou usa o tema claro como padrão
    let currentTheme = localStorage.getItem("theme") || "light"; // Use let para permitir a atualização
    themeLink.href = `./assets/css/${currentTheme}.css`;

    themeBtn.addEventListener("click", () => {
        // Atualiza o currentTheme antes de calcular o newTheme
        currentTheme = currentTheme === "dark" ? "light" : "dark"; 

        themeLink.href = `./assets/css/${currentTheme}.css`;

        // Salva o tema atual no localStorage
        localStorage.setItem("theme", currentTheme);

        // Atualiza o texto do botão
        themeBtn.textContent = currentTheme === "dark" ? "Tema Claro" : "Tema Escuro";
    });

    loadTasks();
});