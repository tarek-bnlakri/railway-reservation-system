export class MinHeap<T>{
    private heap:{priority:number, value:T}[]=[]

    size():number{
        return this.heap.length
    }

    isEmpty():boolean{
        return this.heap.length ===0
    }
    private getParentIndex(i:number):number{
        return Math.floor((i-1)/2)
    }
    private getLeftChildIndex(i:number):number{
        return (2*i)+1
    }
    private getRightChildIndex(i:number):number{
        return (2*i)+2
    }
    private swap(index1:number, index2:number):void{
        const temp = this.heap[index1]
        this.heap[index1]=this.heap[index2]!
        this.heap[index2]=temp!
    }

    insert(value:T, priority:number):void{
        this.heap.push({priority,value})
        this.bubbleUp(this.heap.length-1)

    }
    private bubbleUp(index:number):void{
        while(index >0){
            const parentIndex = this.getParentIndex(index)
            if (this.heap[parentIndex]!.priority > this.heap[index]!.priority){
                this.swap(parentIndex,index)
                index =parentIndex
            }else
                break
        }
    }
    extractMin():{priority:number, value:T} | undefined{
        if(this.heap.length ===0){
            return undefined
        }
        if ( this.heap.length ===1){
            return this.heap.pop()
        }
        const min = this.heap[0]
        this.heap[0]=this.heap.pop()!

        this.bubbleDown(0)
        return min
    }

    private bubbleDown(index:number):void{
            while(true){
                const left = this.getLeftChildIndex(index)
                const right = this.getRightChildIndex(index)
                let smallestIndex = index
                if(left<this.size() && this.heap[left]!.priority < this.heap[index]!.priority){
                    smallestIndex=left
                }
                if(right<this.size() && this.heap[right]!.priority < this.heap[index]!.priority){
                    smallestIndex=right
                }
                if (smallestIndex === index) 
                    break
                else{ 
                    this.swap(smallestIndex,index)
                    index = smallestIndex
                }
            }
    }

}