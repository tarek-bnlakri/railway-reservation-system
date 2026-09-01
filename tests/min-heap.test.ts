import { describe,it,expect } from "vitest";
import {MinHeap} from '../src/shared/data-structures/min-heap.js'

describe("MinHeap",()=>{
    it(" always extracts the smallest priority first ",()=>{
    const heap = new MinHeap<string>();

    heap.insert("A",30)
    heap.insert("B",10)
    heap.insert("C",20)

    expect(heap.extractMin()?.value).toBe("B")
    expect(heap.extractMin()?.value).toBe("C")
    expect(heap.extractMin()?.value).toBe("A")

    expect(heap.isEmpty()).toBe(true);

})

})
